import { NextResponse } from "next/server";
import { getProductBySlug } from "@/lib/marketplace/catalog";
import { createOrder } from "@/lib/marketplace/db";
import { gatewayRegistry } from "@/lib/marketplace/gateways/registry";
import type { Currency } from "@/lib/marketplace/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { slug, email, currency = "BDT", gateway = "sandbox" } = body;

    if (!slug || typeof slug !== "string") {
      return NextResponse.json({ error: "Product slug is required" }, { status: 400 });
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "A valid email address is required" }, { status: 400 });
    }

    const validCurrency: Currency = currency === "USD" ? "USD" : "BDT";
    const product = await getProductBySlug(slug);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const amount = validCurrency === "USD" ? product.priceUSD : product.priceBDT;
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
    const randomHex = Math.random().toString(36).substring(2, 7).toUpperCase();
    const orderReference = `IAM-${dateStr}-${randomHex}`;
    const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    const order = createOrder({
      id: orderId,
      reference: orderReference,
      customerEmail: email.toLowerCase().trim(),
      productId: product.slug,
      productName: product.title,
      releaseVersion: product.currentVersion,
      amount,
      currency: validCurrency,
      gateway,
      status: "pending",
    });

    const activeGateway = gatewayRegistry.get(gateway);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const session = await activeGateway.createSession({
      orderId: order.id,
      orderReference: order.reference,
      customerEmail: order.customerEmail,
      productTitle: product.title,
      amount: order.amount,
      currency: order.currency,
      returnUrl: `${siteUrl}/store/return?orderId=${encodeURIComponent(order.id)}`,
      cancelUrl: `${siteUrl}/store/${product.slug}`,
      webhookUrl: `${siteUrl}/api/webhooks/${activeGateway.name}`,
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderReference: order.reference,
      redirectUrl: session.redirectUrl,
      sessionId: session.sessionId,
    });
  } catch (err: any) {
    console.error("Checkout error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error during checkout" },
      { status: 500 }
    );
  }
}

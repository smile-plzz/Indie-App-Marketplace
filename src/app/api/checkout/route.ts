import crypto from "node:crypto";
import { orderAccessToken } from "@/lib/marketplace/security";
import { rateLimited } from "@/lib/marketplace/rate-limit";
import { updateOrderStatus } from "@/lib/marketplace/db";
import { NextResponse } from "next/server";
import { getProductBySlug } from "@/lib/marketplace/catalog";
import { createOrder } from "@/lib/marketplace/db";
import { gatewayRegistry } from "@/lib/marketplace/gateways/registry";
import type { Currency } from "@/lib/marketplace/types";
export async function POST(req: Request) {
    try {
        if (await rateLimited(req, "checkout", 10))
            return NextResponse.json({ error: "Please wait before trying again" }, { status: 429 });
        const body = await req.json();
        const { slug, email, currency = "BDT", gateway = process.env.DEFAULT_GATEWAY || "sandbox" } = body;
        if (!slug || typeof slug !== "string") {
            return NextResponse.json({ error: "Product slug is required" }, { status: 400 });
        }
        if (!email || typeof email !== "string" || !/^\S+@\S+\.\S+$/.test(email)) {
            return NextResponse.json({ error: "A valid email address is required" }, { status: 400 });
        }
        if (!["BDT", "USD"].includes(currency))
            return NextResponse.json({ error: "Unsupported currency" }, { status: 400 });
        if (typeof gateway !== "string")
            return NextResponse.json({ error: "Invalid gateway" }, { status: 400 });
        if (process.env.NODE_ENV === "production") {
          if (!process.env.DATABASE_URL || process.env.EMAIL_SERVICE !== "resend" || !process.env.RESEND_API_KEY || !["r2", "s3"].includes(process.env.STORAGE_PROVIDER || "") || !process.env.STORAGE_BUCKET || !process.env.STORAGE_ENDPOINT || !process.env.STORAGE_ACCESS_KEY_ID || !process.env.STORAGE_SECRET_ACCESS_KEY) return NextResponse.json({ error: "Checkout is not available yet. Please use the free source route." }, { status: 503 });
        }
        const activeGateway = gatewayRegistry.get(gateway);
        const validCurrency: Currency = currency === "USD" ? "USD" : "BDT";
        const product = await getProductBySlug(slug);
        if (!product || product.status !== "published") {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }
        const amount = validCurrency === "USD" ? product.priceUSD : product.priceBDT;
        const now = new Date();
        const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
        const randomHex = crypto.randomBytes(8).toString("hex").toUpperCase();
        const orderReference = `IAM-${dateStr}-${randomHex}`;
        const orderId = `ord_${crypto.randomUUID()}`;
        const order = await createOrder({
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
        const access = orderAccessToken(order.id);
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
        const session = await activeGateway.createSession({
            orderId: order.id,
            orderReference: order.reference,
            customerEmail: order.customerEmail,
            productTitle: product.title,
            amount: order.amount,
            currency: order.currency,
            returnUrl: `${siteUrl}/store/return?orderId=${encodeURIComponent(order.id)}&access=${access}`,
            cancelUrl: `${siteUrl}/store/${product.slug}`,
            webhookUrl: `${siteUrl}/api/webhooks/${activeGateway.name}`,
        });
        await updateOrderStatus(order.id, "pending", session.gatewayReference);
        return NextResponse.json({
            success: true,
            orderId: order.id,
            orderReference: order.reference,
            redirectUrl: session.redirectUrl,
            sessionId: session.sessionId,
            accessToken: access,
        });
    }
    catch (err: any) {
        console.error("Checkout error:", err);
        return NextResponse.json({ error: err?.message || "Internal server error during checkout" }, { status: 500 });
    }
}

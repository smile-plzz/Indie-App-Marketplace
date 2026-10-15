import { NextResponse } from "next/server";
import { getOrderById, completeVerifiedPayment } from "@/lib/marketplace/db";
import { verifyOrderAccess } from "@/lib/marketplace/security";
import { gatewayRegistry } from "@/lib/marketplace/gateways/registry";
import { deliverReceipt } from "@/lib/marketplace/gateways/settlement";

type Context = { params: Promise<{ gateway: string }> };
async function callback(req: Request, context: Context) {
  const url = new URL(req.url);
  const id = url.searchParams.get("orderId") || "";
  const access = url.searchParams.get("access");
  if (!verifyOrderAccess(id, access)) return NextResponse.json({ error: "Purchase access required" }, { status: 401 });
  const order = await getOrderById(id);
  const gateway = (await context.params).gateway;
  if (!order || order.gateway !== gateway || !["bkash", "sslcommerz"].includes(gateway)) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  const target = new URL("/store/return", process.env.NEXT_PUBLIC_SITE_URL || req.url);
  target.searchParams.set("orderId", id);
  target.searchParams.set("access", access!);
  try {
    const payload: Record<string, unknown> = req.method === "POST" ? Object.fromEntries(await req.formData()) : Object.fromEntries(url.searchParams);
    if (order.status !== "refunded" && order.status !== "paid") {
      const reference = gateway === "bkash" ? payload.paymentID : payload.val_id;
      if (typeof reference === "string" && (gateway !== "bkash" || reference === order.gatewayReference)) {
        const verification = await gatewayRegistry.get(gateway).verifyPayment({ orderId: id, orderReference: order.reference, expectedAmount: order.amount, expectedCurrency: order.currency, gatewayReference: reference, payload });
        if (verification.success && verification.gateway === gateway && verification.amount === order.amount && verification.currency === order.currency) {
          const settled = await completeVerifiedPayment(id, gateway, verification.gatewayReference, verification.paidAt);
          await deliverReceipt(settled);
        }
      }
    }
  } catch (error) { console.error("Gateway callback pending retry", error); }
  // The page reads durable state; redirects never constitute payment confirmation.
  return NextResponse.redirect(target, 303);
}
export async function GET(req: Request, context: Context) { return callback(req, context); }
export async function POST(req: Request, context: Context) { return callback(req, context); }

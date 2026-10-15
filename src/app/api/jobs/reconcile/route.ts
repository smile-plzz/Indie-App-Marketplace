import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { listPendingReceipts, listStalePendingOrders, completeVerifiedPayment } from "@/lib/marketplace/db";
import { gatewayRegistry } from "@/lib/marketplace/gateways/registry";
import { deliverReceipt } from "@/lib/marketplace/gateways/settlement";
export async function POST(req: Request) {
    const secret = process.env.CRON_SECRET;
    const supplied = req.headers.get("authorization") || "";
    const expected = `Bearer ${secret}`;
    if (!secret || supplied.length !== expected.length || !timingSafeEqual(Buffer.from(supplied), Buffer.from(expected)))
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    let settled = 0;
    let pending = 0;
    for (const order of await listStalePendingOrders()) {
      try {
        const verification = await gatewayRegistry.get(order.gateway).verifyPayment({
          orderId: order.id, orderReference: order.reference, expectedAmount: order.amount,
          expectedCurrency: order.currency, gatewayReference: order.gatewayReference, queryOnly: true,
        });
        if (verification.success && verification.gateway === order.gateway && verification.amount === order.amount && verification.currency === order.currency && verification.gatewayReference) {
          await completeVerifiedPayment(order.id, order.gateway, verification.gatewayReference, verification.paidAt);
          settled++;
        } else pending++;
      } catch { pending++; }
    }
    let delivered = 0;
    let failed = 0;
    for (const order of await listPendingReceipts()) {
        try {
            if (await deliverReceipt(order))
                delivered++;
            else
                failed++;
        }
        catch {
            failed++;
        }
    }
    return NextResponse.json({ settled, pending, delivered, failed });
}

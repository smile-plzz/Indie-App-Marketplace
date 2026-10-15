import { NextResponse } from "next/server";
import { getOrderById, getOrderByReference, completeVerifiedPayment, updateOrderStatus, hasWebhookEventBeenProcessed, recordWebhookEvent } from "@/lib/marketplace/db";
import { gatewayRegistry } from "@/lib/marketplace/gateways/registry";
import { deliverReceipt } from "@/lib/marketplace/gateways/settlement";
export async function POST(req: Request, { params }: {
    params: Promise<{
        gateway: string;
    }>;
}) {
    try {
        const gateway = (await params).gateway.toLowerCase();
        let adapter;
        try {
            adapter = gatewayRegistry.get(gateway);
        }
        catch {
            return NextResponse.json({ error: "Unknown payment gateway" }, { status: 400 });
        }
        const contentType = req.headers.get("content-type") || "";
        let payload: Record<string, unknown>;
        if (contentType.includes("application/json"))
            payload = await req.json();
        else if (contentType.includes("application/x-www-form-urlencoded"))
            payload = Object.fromEntries(await req.formData());
        else
            return NextResponse.json({ error: "Unsupported content type" }, { status: 415 });
        if (!payload || typeof payload !== "object" || Array.isArray(payload))
            return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
        const identifier = payload.orderId || payload.tran_id || payload.orderReference || payload.merchantInvoiceNumber;
        if (typeof identifier !== "string")
            return NextResponse.json({ error: "Missing order reference" }, { status: 400 });
        const order = await getOrderById(identifier) || await getOrderByReference(identifier);
        if (!order)
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        if (order.gateway !== gateway)
            return NextResponse.json({ error: "Gateway does not match order" }, { status: 400 });
        if (order.status === "refunded")
            return NextResponse.json({ error: "Order has been refunded" }, { status: 409 });
        // Completed orders may still have an unsent receipt after a provider outage.
        if (order.status === "paid") {
            const settled = await completeVerifiedPayment(order.id, gateway, order.gatewayReference || order.id);
            if (!await deliverReceipt(settled))
                return NextResponse.json({ error: "Receipt delivery pending retry" }, { status: 503 });
            return NextResponse.json({ success: true, orderId: order.id, status: "paid" });
        }
        const reference = gateway === "bkash" ? payload.paymentID : gateway === "sslcommerz" ? payload.val_id : payload.txnId || payload.ref || payload.sessionId;
        const verification = await adapter.verifyPayment({ orderId: order.id, orderReference: order.reference, expectedAmount: order.amount, expectedCurrency: order.currency, gatewayReference: typeof reference === "string" ? reference : undefined, payload });
        if (!verification.success || verification.gateway !== gateway || verification.amount !== order.amount || verification.currency !== order.currency || !verification.gatewayReference) {
            if (gateway === "sandbox" && verification.failureReason === "Simulated sandbox payment failure") await updateOrderStatus(order.id, "failed");
        // An invalid or transient callback must not overwrite a valid order state.
            return NextResponse.json({ success: false, error: verification.failureReason || "Payment verification failed" }, { status: 400 });
        }
        const settled = await completeVerifiedPayment(order.id, gateway, verification.gatewayReference, verification.paidAt);
        const eventId = `payment:${verification.gatewayReference}`;
        if (!await hasWebhookEventBeenProcessed(gateway, eventId))
            await recordWebhookEvent(gateway, eventId, payload);
        if (!await deliverReceipt(settled))
            return NextResponse.json({ error: "Receipt delivery pending retry" }, { status: 503 });
        return NextResponse.json({ success: true, orderId: settled.id, orderReference: settled.reference, status: settled.status });
    }
    catch (error) {
        console.error("Webhook processing failed", error);
        return NextResponse.json({ error: "Payment processing unavailable; retry later" }, { status: 503 });
    }
}

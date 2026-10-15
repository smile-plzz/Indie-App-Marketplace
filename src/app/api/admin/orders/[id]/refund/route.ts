import { NextResponse } from "next/server";
import { getOrderById, claimRefundAttempt, markRefundForReview, completeRefundAttempt, recordConfirmedMerchantRefund } from "@/lib/marketplace/db";
import { gatewayRegistry } from "@/lib/marketplace/gateways/registry";

const reviewMessage = "A refund attempt is already recorded or its outcome is uncertain. Reconcile it in the merchant dashboard before attempting another refund.";
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  let claimedOrderId: string | undefined;
  try {
    const { id } = await params;
    const order = await getOrderById(id);
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    const body = await req.json().catch(() => ({}));
    if (body.action === "record-confirmed") {
      const reference = typeof body.merchantRefundReference === "string" ? body.merchantRefundReference.trim() : "";
      const evidence = typeof body.reason === "string" ? body.reason.trim() : "";
      if (!reference || reference.length > 255 || !evidence || evidence.length > 1000) return NextResponse.json({ error: "Provide the confirmed merchant refund reference and reconciliation evidence" }, { status: 400 });
      const recorded = await recordConfirmedMerchantRefund(id, reference, evidence);
      return NextResponse.json({ success: true, message: "Confirmed merchant refund recorded and download access revoked", refund: recorded });
    }
    if (body.action && body.action !== "initiate") return NextResponse.json({ error: "Unknown refund action" }, { status: 400 });
    if (order.status !== "paid") return NextResponse.json({ error: `Cannot refund order with status '${order.status}'` }, { status: 400 });
    const reason = typeof body.reason === "string" && body.reason.trim() ? body.reason.trim().slice(0, 1000) : "Admin issued refund";
    const gateway = gatewayRegistry.get(order.gateway);
    if (!await claimRefundAttempt(id, reason)) return NextResponse.json({ error: reviewMessage }, { status: 409 });
    claimedOrderId = id;
    // A durable unique claim precedes every external refund. Never automatically retry an uncertain outcome.
    const result = await gateway.refund({ orderId: id, gatewayReference: order.gatewayReference || id, amount: order.amount, currency: order.currency, reason });
    if (!result.success) {
      await markRefundForReview(id, result.failureReason || "Gateway did not confirm the refund", result.refundReference);
      return NextResponse.json({ error: reviewMessage }, { status: 502 });
    }
    const refund = await completeRefundAttempt(id, result.refundReference);
    return NextResponse.json({ success: true, message: "Order refunded successfully and download access revoked", refund });
  } catch (error) {
    console.error("Refund requires merchant reconciliation", error);
    if (claimedOrderId) {
      try { await markRefundForReview(claimedOrderId, error instanceof Error ? error.message : "Unknown refund outcome"); } catch { /* Durable processing claim still prevents retries. */ }
      return NextResponse.json({ error: reviewMessage }, { status: 502 });
    }
    return NextResponse.json({ error: "Refund processing unavailable" }, { status: 503 });
  }
}

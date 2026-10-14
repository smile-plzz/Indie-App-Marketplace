import { NextResponse } from "next/server";
import { getOrderById, recordRefund } from "@/lib/marketplace/db";
import { gatewayRegistry } from "@/lib/marketplace/gateways/registry";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = getOrderById(id);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status !== "paid") {
      return NextResponse.json(
        { error: `Cannot refund order with status '${order.status}'` },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const reason = body.reason || "Admin issued refund";

    // 1. Call Gateway Adapter refund method
    const gateway = gatewayRegistry.get(order.gateway);
    const refundResult = await gateway.refund({
      orderId: order.id,
      gatewayReference: order.gatewayReference || order.id,
      amount: order.amount,
      currency: order.currency,
      reason,
    });

    if (!refundResult.success) {
      return NextResponse.json(
        { error: refundResult.failureReason || "Gateway rejected refund request" },
        { status: 502 }
      );
    }

    // 2. Record Refund in DB and revoke order status to 'refunded'
    const refundId = `ref_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const refund = recordRefund({
      id: refundId,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      reason,
    });

    return NextResponse.json({
      success: true,
      message: "Order refunded successfully and download access revoked",
      refund,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to process refund" }, { status: 500 });
  }
}

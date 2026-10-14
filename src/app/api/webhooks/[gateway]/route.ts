import { NextResponse } from "next/server";
import {
  getOrderById,
  getOrderByReference,
  updateOrderStatus,
  hasWebhookEventBeenProcessed,
  recordWebhookEvent,
  getDownloadByOrderId,
} from "@/lib/marketplace/db";
import { gatewayRegistry } from "@/lib/marketplace/gateways/registry";
import { createOrderDownloadRecord } from "@/lib/marketplace/delivery";
import { getEmailService } from "@/lib/marketplace/email";
import { getProductBySlug } from "@/lib/marketplace/catalog";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ gateway: string }> }
) {
  try {
    const { gateway } = await params;
    let payload: Record<string, unknown> = {};

    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      payload = await req.json();
    } else if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await req.formData();
      formData.forEach((value, key) => {
        payload[key] = value.toString();
      });
    }

    // Extract identifier for the event
    const eventId =
      (payload.eventId as string) ||
      (payload.tran_id as string) ||
      (payload.paymentID as string) ||
      (payload.trxID as string) ||
      (payload.sessionId as string) ||
      (payload.orderId as string) ||
      `evt_${Date.now()}`;

    // 1. Idempotency Check
    if (hasWebhookEventBeenProcessed(gateway, eventId)) {
      return NextResponse.json({
        success: true,
        message: "Webhook already processed (idempotent skip)",
        eventId,
      });
    }

    // 2. Identify the Order
    const orderIdentifier =
      (payload.orderId as string) ||
      (payload.tran_id as string) ||
      (payload.orderReference as string) ||
      (payload.merchantInvoiceNumber as string);

    if (!orderIdentifier) {
      return NextResponse.json(
        { error: "Missing order reference in webhook payload" },
        { status: 400 }
      );
    }

    let order = getOrderById(orderIdentifier);
    if (!order) {
      order = getOrderByReference(orderIdentifier);
    }

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // If order is already paid, record event and return success
    if (order.status === "paid") {
      recordWebhookEvent(gateway, eventId, payload);
      return NextResponse.json({
        success: true,
        message: "Order was already marked paid",
        orderId: order.id,
      });
    }

    // 3. Verify Payment with the Gateway Adapter
    const gatewayAdapter = gatewayRegistry.get(gateway);
    const verification = await gatewayAdapter.verifyPayment({
      orderId: order.id,
      orderReference: order.reference,
      expectedAmount: order.amount,
      expectedCurrency: order.currency,
      gatewayReference: (payload.trxID || payload.val_id || payload.paymentID || payload.ref) as string,
      payload,
    });

    if (!verification.success) {
      updateOrderStatus(order.id, "failed");
      recordWebhookEvent(gateway, eventId, {
        payload,
        error: verification.failureReason,
      });

      return NextResponse.json(
        {
          success: false,
          error: verification.failureReason || "Payment verification failed",
        },
        { status: 400 }
      );
    }

    // 4. Update Order to Paid
    const updatedOrder = updateOrderStatus(
      order.id,
      "paid",
      verification.gatewayReference,
      verification.paidAt
    );

    if (!updatedOrder) {
      return NextResponse.json({ error: "Failed to update order status" }, { status: 500 });
    }

    // 5. Generate Secure Download Record
    let download = getDownloadByOrderId(updatedOrder.id);
    let plaintextToken = "";

    if (!download) {
      const result = createOrderDownloadRecord(updatedOrder.id);
      download = result.download;
      plaintextToken = result.plaintextToken;
    }

    // 6. Send Email Receipt
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const downloadUrl = `${siteUrl}/api/download/${plaintextToken || download.tokenHash}`;
    const product = await getProductBySlug(updatedOrder.productId);
    const emailService = getEmailService();

    await emailService.sendOrderReceipt(
      updatedOrder,
      downloadUrl,
      product?.sha256Checksum
    );

    // 7. Record Webhook Event for Idempotency
    recordWebhookEvent(gateway, eventId, payload);

    return NextResponse.json({
      success: true,
      orderId: updatedOrder.id,
      orderReference: updatedOrder.reference,
      status: updatedOrder.status,
    });
  } catch (err: any) {
    console.error("Webhook processing error:", err);
    return NextResponse.json({ error: err?.message || "Webhook error" }, { status: 500 });
  }
}

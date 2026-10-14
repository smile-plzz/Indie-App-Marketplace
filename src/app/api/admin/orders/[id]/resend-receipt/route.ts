import { NextResponse } from "next/server";
import { getOrderById, getDownloadByOrderId } from "@/lib/marketplace/db";
import { createOrderDownloadRecord } from "@/lib/marketplace/delivery";
import { getEmailService } from "@/lib/marketplace/email";
import { getProductBySlug } from "@/lib/marketplace/catalog";

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
        { error: `Cannot resend receipt for order with status '${order.status}'` },
        { status: 400 }
      );
    }

    let download = getDownloadByOrderId(order.id);
    let plaintextToken = "";

    if (!download) {
      const result = createOrderDownloadRecord(order.id);
      download = result.download;
      plaintextToken = result.plaintextToken;
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const downloadUrl = `${siteUrl}/api/download/${plaintextToken || download.tokenHash}`;
    const product = await getProductBySlug(order.productId);
    const emailService = getEmailService();

    const sent = await emailService.sendOrderReceipt(
      order,
      downloadUrl,
      product?.sha256Checksum
    );

    return NextResponse.json({
      success: true,
      message: sent ? "Receipt resent successfully" : "Email service did not confirm delivery",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to resend receipt" }, { status: 500 });
  }
}

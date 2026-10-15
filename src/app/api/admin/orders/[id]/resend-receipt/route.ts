import { NextResponse } from "next/server";
import { getOrderById } from "@/lib/marketplace/db";
import { orderAccessToken } from "@/lib/marketplace/security";
import { randomUUID } from "node:crypto";
import { getEmailService } from "@/lib/marketplace/email";
import { getReleaseForProduct } from "@/lib/marketplace/catalog";
export async function POST(req: Request, { params }: {
    params: Promise<{
        id: string;
    }>;
}) {
    try {
        const { id } = await params;
        const order = await getOrderById(id);
        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }
        if (order.status !== "paid") {
            return NextResponse.json({ error: `Cannot resend receipt for order with status '${order.status}'` }, { status: 400 });
        }
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
        const downloadUrl = `${siteUrl}/store/return?orderId=${encodeURIComponent(order.id)}&access=${orderAccessToken(order.id)}`;
        const product = await getReleaseForProduct(order.productId, order.releaseVersion);
        const emailService = getEmailService();
        const sent = await emailService.sendOrderReceipt(order, downloadUrl, product?.sha256Checksum, `receipt-resend/${order.id}/${randomUUID()}`);
        if (!sent)
            return NextResponse.json({ error: "Email delivery failed. Please retry." }, { status: 502 });
        return NextResponse.json({
            success: true,
            message: sent ? "Receipt resent successfully" : "Email service did not confirm delivery",
        });
    }
    catch (err: any) {
        return NextResponse.json({ error: err?.message || "Failed to resend receipt" }, { status: 500 });
    }
}

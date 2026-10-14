import { NextResponse } from "next/server";
import { verifyMagicLinkToken } from "@/lib/marketplace/delivery";
import { getOrdersByEmail, getDownloadByOrderId } from "@/lib/marketplace/db";
import { getProductBySlug } from "@/lib/marketplace/catalog";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Access token is required" }, { status: 400 });
    }

    const verification = verifyMagicLinkToken(token);
    if (!verification.valid || !verification.email) {
      return NextResponse.json(
        { error: verification.error || "Invalid or expired access token" },
        { status: 401 }
      );
    }

    const orders = getOrdersByEmail(verification.email);
    const enrichedOrders = await Promise.all(
      orders.map(async (order) => {
        const product = await getProductBySlug(order.productId);
        const download = order.status === "paid" ? getDownloadByOrderId(order.id) : null;

        return {
          id: order.id,
          reference: order.reference,
          productName: order.productName,
          releaseVersion: order.releaseVersion,
          amount: order.amount,
          currency: order.currency,
          status: order.status,
          createdAt: order.createdAt,
          paidAt: order.paidAt,
          product: product
            ? {
                title: product.title,
                currentVersion: product.currentVersion,
                sha256Checksum: product.sha256Checksum,
                repoUrl: product.repoUrl,
              }
            : null,
          download: download
            ? {
                expiresAt: download.expiresAt,
                downloadCount: download.downloadCount,
                maxDownloads: download.maxDownloads,
                hasRemaining: download.downloadCount < download.maxDownloads,
              }
            : null,
        };
      })
    );

    return NextResponse.json({
      success: true,
      email: verification.email,
      orders: enrichedOrders,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to lookup orders" }, { status: 500 });
  }
}

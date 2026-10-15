import { verifyOrderAccess } from "@/lib/marketplace/security";
import { NextResponse } from "next/server";
import { getOrderById, getOrderByReference, getDownloadByOrderId } from "@/lib/marketplace/db";
import { getProductBySlug } from "@/lib/marketplace/catalog";
export async function GET(req: Request, { params }: {
    params: Promise<{
        id: string;
    }>;
}) {
    try {
        const { id } = await params;
        let order = await getOrderById(id);
        if (!order) {
            order = await getOrderByReference(id);
        }
        if (!order || !verifyOrderAccess(order.id, new URL(req.url).searchParams.get("access"))) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }
        const product = await getProductBySlug(order.productId);
        const download = order.status === "paid" ? await getDownloadByOrderId(order.id) : null;
        return NextResponse.json({
            order: {
                id: order.id,
                reference: order.reference,
                customerEmail: order.customerEmail,
                productId: order.productId,
                productName: order.productName,
                releaseVersion: order.releaseVersion,
                amount: order.amount,
                currency: order.currency,
                status: order.status,
                gateway: order.gateway,
                createdAt: order.createdAt,
                paidAt: order.paidAt,
            },
            product: product
                ? {
                    title: product.title,
                    tagline: product.tagline,
                    currentVersion: product.currentVersion,
                    sha256Checksum: product.sha256Checksum,
                    installerSize: product.installerSize,
                    repoUrl: product.repoUrl,
                    minOS: product.minOS,
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
        });
    }
    catch (err: any) {
        return NextResponse.json({ error: err?.message || "Internal error" }, { status: 500 });
    }
}

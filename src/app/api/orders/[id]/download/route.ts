import { rateLimited } from "@/lib/marketplace/rate-limit";
import { NextResponse } from "next/server";
import { getOrderById, getDownloadByOrderId } from "@/lib/marketplace/db";
import { createOrderDownloadRecord, verifyMagicLinkToken, verifyAndConsumeDownload } from "@/lib/marketplace/delivery";
import { verifyOrderAccess } from "@/lib/marketplace/security";
export async function GET(req: Request, { params }: {
    params: Promise<{
        id: string;
    }>;
}) {
    if (await rateLimited(req, "download", 30))
        return NextResponse.json({ error: "Please wait before downloading again" }, { status: 429 });
    const { id } = await params;
    const url = new URL(req.url);
    const order = await getOrderById(id);
    const access = url.searchParams.get("access");
    const magic = verifyMagicLinkToken(url.searchParams.get("token") || "");
    if (!order || (!verifyOrderAccess(id, access) && (!magic.valid || magic.email !== order.customerEmail))) {
        return NextResponse.json({ error: "Purchase access required" }, { status: 401 });
    }
    if (order.status !== "paid")
        return NextResponse.json({ error: "Order is not paid" }, { status: 403 });
    const existing = await getDownloadByOrderId(id);
    if (existing && existing.downloadCount >= existing.maxDownloads)
        return NextResponse.json({ error: "Download limit reached. Contact support." }, { status: 403 });
    const { plaintextToken } = await createOrderDownloadRecord(id, 30, existing?.maxDownloads || 5);
    const result = await verifyAndConsumeDownload(plaintextToken);
    if (!result.valid)
        return NextResponse.json({ error: result.error }, { status: 403 });
    return NextResponse.redirect(new URL(result.signedUrl!, req.url));
}

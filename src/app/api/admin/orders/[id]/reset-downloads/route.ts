import { NextResponse } from "next/server";
import { resetDownloadCount, getOrderById } from "@/lib/marketplace/db";

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

    const body = await req.json().catch(() => ({}));
    const newMax = typeof body.maxDownloads === "number" ? body.maxDownloads : 5;

    const download = resetDownloadCount(order.id, newMax);

    return NextResponse.json({
      success: true,
      message: "Download count reset successfully",
      download,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to reset downloads" }, { status: 500 });
  }
}

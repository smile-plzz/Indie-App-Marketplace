import { NextResponse } from "next/server";
import { listOrders, getMarketplaceStats } from "@/lib/marketplace/db";
import type { OrderStatus } from "@/lib/marketplace/types";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const statusParam = url.searchParams.get("status") as OrderStatus | null;
    const limitParam = parseInt(url.searchParams.get("limit") || "100", 10);

    const orders = listOrders(limitParam, statusParam || undefined);
    const stats = getMarketplaceStats();

    return NextResponse.json({
      success: true,
      stats,
      orders,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to fetch orders" }, { status: 500 });
  }
}

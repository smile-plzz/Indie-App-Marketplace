import { NextResponse } from "next/server";
import { listOrders, getMarketplaceStats } from "@/lib/marketplace/db";
import type { OrderStatus } from "@/lib/marketplace/types";
export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const statusParam = url.searchParams.get("status") as OrderStatus | null;
        const limitParam = parseInt(url.searchParams.get("limit") || "100", 10);
        if (!Number.isSafeInteger(limitParam) || limitParam < 1 || limitParam > 10000 || (statusParam && !["pending","paid","failed","refunded"].includes(statusParam))) return NextResponse.json({ error: "Invalid order filters" }, { status: 400 });
        const [orders, stats] = await Promise.all([listOrders(limitParam, statusParam || undefined), getMarketplaceStats()]);
        return NextResponse.json({
            success: true,
            stats,
            orders,
        });
    }
    catch (err: any) {
        return NextResponse.json({ error: err?.message || "Failed to fetch orders" }, { status: 500 });
    }
}

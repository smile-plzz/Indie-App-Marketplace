import { NextResponse } from "next/server";
import { getDatabase, listOrders } from "@/lib/marketplace/db";
import { POST as reconcile } from "@/app/api/jobs/reconcile/route";

export async function GET(req: Request) {
  if (new URL(req.url).searchParams.get("export") === "orders") {
    const orders = await listOrders(10000);
    const cell = (value: unknown) => `"${String(value ?? "").replace(/^[=+@-]/, "'$&").replace(/"/g, '""')}"`;
    const columns = ["id", "reference", "customerEmail", "productName", "releaseVersion", "amount", "currency", "status", "gateway", "createdAt"] as const;
    const csv = [columns.join(","), ...orders.map(order => columns.map(key => cell(order[key])).join(","))].join("\r\n");
    return new NextResponse(csv, { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": "attachment; filename=orders.csv", "cache-control": "no-store" } });
  }
  const db = await getDatabase();
  const [events, receipts] = await Promise.all([
    db.prepare("SELECT gateway, event_id, processed_at FROM webhook_events ORDER BY processed_at DESC LIMIT 30").all(),
    db.prepare("SELECT state, COUNT(*) AS total FROM receipt_delivery GROUP BY state").all(),
  ]);
  const checks = [
    { label: "Product CMS", ready: Boolean(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID && process.env.SANITY_API_WRITE_TOKEN) },
    { label: "Production database", ready: Boolean(process.env.DATABASE_URL) },
    { label: "Private file storage", ready: Boolean(["r2", "s3"].includes(process.env.STORAGE_PROVIDER || "") && process.env.STORAGE_BUCKET && process.env.STORAGE_ENDPOINT && process.env.STORAGE_ACCESS_KEY_ID && process.env.STORAGE_SECRET_ACCESS_KEY) },
    { label: "Receipt email", ready: process.env.EMAIL_SERVICE === "resend" && Boolean(process.env.RESEND_API_KEY) },
    { label: "Payment gateway", ready: Boolean((process.env.SSLCOMMERZ_STORE_ID && process.env.SSLCOMMERZ_STORE_PASSWD) || (process.env.BKASH_APP_KEY && process.env.BKASH_APP_SECRET && process.env.BKASH_USERNAME && process.env.BKASH_PASSWORD)) },
    { label: "Reconciliation access", ready: Boolean(process.env.CRON_SECRET) },
    { label: "Release publishing", ready: Boolean(process.env.RELEASE_PUBLISH_SECRET && !process.env.RELEASE_PUBLISH_SECRET.startsWith("change-this")) },
  ];
  return NextResponse.json({ checks, events, receipts }, { headers: { "cache-control": "no-store" } });
}

export async function POST(req: Request) {
  if (req.headers.get("origin") !== new URL(req.url).origin) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  return reconcile(new Request(req.url, { method: "POST", headers: { authorization: `Bearer ${process.env.CRON_SECRET || ""}` } }));
}

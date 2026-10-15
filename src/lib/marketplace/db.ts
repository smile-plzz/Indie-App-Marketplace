import { DatabaseDriver } from "./driver";
import path from "node:path";
import type { Order, Download, Refund, WebhookEvent, OrderStatus, Currency } from "./types";
let dbInstance: Promise<DatabaseDriver> | null = null;
export function getDatabasePath(): string {
    if (process.env.NODE_ENV === "test" || process.env.MARKETPLACE_DB_PATH === ":memory:") {
        return ":memory:";
    }
    const configured = process.env.MARKETPLACE_DB_PATH || "./data/marketplace.db";
    return path.resolve(process.cwd(), configured);
}
export async function getDatabase(): Promise<DatabaseDriver> {
    if (!dbInstance) {
        dbInstance = (async () => {
            const db = await DatabaseDriver.open(getDatabasePath());
            await initSchema(db);
            return db;
        })();
    }
    return dbInstance;
}
async function initSchema(db: DatabaseDriver) {
    await db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      reference TEXT UNIQUE NOT NULL,
      customer_email TEXT NOT NULL,
      product_id TEXT NOT NULL,
      product_name TEXT NOT NULL,
      release_version TEXT NOT NULL,
      amount INTEGER NOT NULL,
      currency TEXT NOT NULL,
      gateway TEXT NOT NULL,
      gateway_reference TEXT,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL,
      paid_at TEXT,
      refunded_at TEXT
    );

    CREATE TABLE IF NOT EXISTS downloads (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      token_hash TEXT UNIQUE NOT NULL,
      expires_at TEXT NOT NULL,
      download_count INTEGER NOT NULL DEFAULT 0,
      max_downloads INTEGER NOT NULL DEFAULT 5,
      last_used_at TEXT,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS refunds (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      amount INTEGER NOT NULL,
      currency TEXT NOT NULL,
      reason TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS webhook_events (
      id TEXT PRIMARY KEY,
      gateway TEXT NOT NULL,
      event_id TEXT NOT NULL,
      payload TEXT NOT NULL,
      processed_at TEXT NOT NULL,
      UNIQUE (gateway, event_id)
    );

    CREATE TABLE IF NOT EXISTS refund_attempts (
      order_id TEXT PRIMARY KEY, state TEXT NOT NULL, reason TEXT NOT NULL,
      gateway_reference TEXT, detail TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id)
    );
    CREATE TABLE IF NOT EXISTS reconciliation_checks (
      order_id TEXT PRIMARY KEY, checked_at BIGINT NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id)
    );
    CREATE TABLE IF NOT EXISTS reconciliation_batches (
      id INTEGER PRIMARY KEY, touched_at BIGINT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS payment_sessions (
      order_id TEXT PRIMARY KEY, reference TEXT NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id)
    );
    CREATE TABLE IF NOT EXISTS payment_transactions (
      gateway TEXT NOT NULL, reference TEXT NOT NULL, order_id TEXT NOT NULL UNIQUE,
      PRIMARY KEY (gateway, reference), FOREIGN KEY (order_id) REFERENCES orders(id)
    );
    CREATE TABLE IF NOT EXISTS receipt_delivery (
      order_id TEXT PRIMARY KEY, state TEXT NOT NULL DEFAULT 'pending', leased_until BIGINT NOT NULL DEFAULT 0,
      FOREIGN KEY (order_id) REFERENCES orders(id)
    );
    CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(customer_email);
    CREATE INDEX IF NOT EXISTS idx_orders_reference ON orders(reference);
    CREATE INDEX IF NOT EXISTS idx_downloads_token_hash ON downloads(token_hash);
    CREATE INDEX IF NOT EXISTS idx_downloads_order_id ON downloads(order_id);
  `);
}
export async function closeDatabase(): Promise<void> {
    if (dbInstance) {
        try {
            await (await dbInstance).close();
        }
        catch {
            // Ignore if already closed
        }
        dbInstance = null;
    }
}
// Map DB row to Order domain model
interface OrderRow {
    id: string;
    reference: string;
    customer_email: string;
    product_id: string;
    product_name: string;
    release_version: string;
    amount: number;
    currency: string;
    gateway: string;
    gateway_reference: string | null;
    status: string;
    created_at: string;
    paid_at: string | null;
    refunded_at: string | null;
}
function mapOrderRow(row: OrderRow): Order {
    return {
        id: row.id,
        reference: row.reference,
        customerEmail: row.customer_email,
        productId: row.product_id,
        productName: row.product_name,
        releaseVersion: row.release_version,
        amount: Number(row.amount),
        currency: row.currency as Currency,
        gateway: row.gateway,
        gatewayReference: row.gateway_reference ?? undefined,
        status: row.status as OrderStatus,
        createdAt: row.created_at,
        paidAt: row.paid_at ?? undefined,
        refundedAt: row.refunded_at ?? undefined,
    };
}
export async function createOrder(data: Omit<Order, "createdAt">): Promise<Order> {
    const db = await getDatabase();
    const createdAt = new Date().toISOString();
    const stmt = db.prepare(`
    INSERT INTO orders (
      id, reference, customer_email, product_id, product_name,
      release_version, amount, currency, gateway, gateway_reference,
      status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
    await stmt.run(data.id, data.reference, data.customerEmail, data.productId, data.productName, data.releaseVersion, data.amount, data.currency, data.gateway, data.gatewayReference ?? null, data.status, createdAt);
    return {
        ...data,
        createdAt,
    };
}
export async function getOrderById(id: string): Promise<Order | null> {
    const db = await getDatabase();
    const stmt = db.prepare("SELECT * FROM orders WHERE id = ?");
    const row = await stmt.get(id) as unknown as OrderRow | undefined;
    return row ? mapOrderRow(row) : null;
}
export async function getOrderByReference(reference: string): Promise<Order | null> {
    const db = await getDatabase();
    const stmt = db.prepare("SELECT * FROM orders WHERE reference = ?");
    const row = await stmt.get(reference) as unknown as OrderRow | undefined;
    return row ? mapOrderRow(row) : null;
}
export async function getOrdersByEmail(email: string): Promise<Order[]> {
    const db = await getDatabase();
    const stmt = db.prepare("SELECT * FROM orders WHERE customer_email = ? ORDER BY created_at DESC");
    const rows = await stmt.all(email.toLowerCase().trim()) as unknown as OrderRow[];
    return rows.map(mapOrderRow);
}
export async function listOrders(limit = 100, status?: OrderStatus): Promise<Order[]> {
    if (!Number.isSafeInteger(limit) || limit < 1 || limit > 10000) throw new Error("Limit must be between 1 and 10000");
    const db = await getDatabase();
    if (status) {
        const stmt = db.prepare("SELECT * FROM orders WHERE status = ? ORDER BY created_at DESC LIMIT ?");
        const rows = await stmt.all(status, limit) as unknown as OrderRow[];
        return rows.map(mapOrderRow);
    }
    const stmt = db.prepare("SELECT * FROM orders ORDER BY created_at DESC LIMIT ?");
    const rows = await stmt.all(limit) as unknown as OrderRow[];
    return rows.map(mapOrderRow);
}
export async function updateOrderStatus(id: string, status: OrderStatus, gatewayReference?: string, paidAt?: string): Promise<Order | null> {
    const db = await getDatabase();
    return db.transaction(async () => {
        await db.lockOrder(id);
    const current = await getOrderById(id);
    if (!current)
        return null;
    const transitions: Record<OrderStatus, OrderStatus[]> = {
        pending: ["pending", "paid", "failed"], failed: ["failed", "paid"],
        paid: ["paid", "refunded"], refunded: ["refunded"],
    };
    if (!transitions[current.status].includes(status))
        throw new Error("Invalid order status transition");
    const now = new Date().toISOString();
    let paidTimestamp = current.paidAt;
    let refundedTimestamp = current.refundedAt;
    if (status === "paid" && !paidTimestamp) {
        paidTimestamp = paidAt || now;
    }
    else if (status === "refunded" && !refundedTimestamp) {
        refundedTimestamp = now;
    }
    const finalGatewayRef = gatewayReference !== undefined ? gatewayReference : current.gatewayReference;
    const stmt = db.prepare(`
    UPDATE orders
    SET status = ?, gateway_reference = ?, paid_at = ?, refunded_at = ?
    WHERE id = ?
  `);
    await stmt.run(status, finalGatewayRef ?? null, paidTimestamp ?? null, refundedTimestamp ?? null, id);
    return await getOrderById(id);
    });
}
// Downloads
interface DownloadRow {
    id: string;
    order_id: string;
    token_hash: string;
    expires_at: string;
    download_count: number;
    max_downloads: number;
    last_used_at: string | null;
}
function mapDownloadRow(row: DownloadRow): Download {
    return {
        id: row.id,
        orderId: row.order_id,
        tokenHash: row.token_hash,
        expiresAt: row.expires_at,
        downloadCount: Number(row.download_count),
        maxDownloads: Number(row.max_downloads),
        lastUsedAt: row.last_used_at ?? undefined,
    };
}
export async function createDownload(data: Omit<Download, "downloadCount">): Promise<Download> {
    const db = await getDatabase();
    const stmt = db.prepare(`
    INSERT INTO downloads (id, order_id, token_hash, expires_at, download_count, max_downloads)
    VALUES (?, ?, ?, ?, 0, ?)
  `);
    await stmt.run(data.id, data.orderId, data.tokenHash, data.expiresAt, data.maxDownloads);
    return {
        ...data,
        downloadCount: 0,
    };
}
export async function getDownloadByTokenHash(tokenHash: string): Promise<Download | null> {
    const db = await getDatabase();
    const stmt = db.prepare("SELECT * FROM downloads WHERE token_hash = ?");
    const row = await stmt.get(tokenHash) as unknown as DownloadRow | undefined;
    return row ? mapDownloadRow(row) : null;
}
export async function getDownloadByOrderId(orderId: string): Promise<Download | null> {
    const db = await getDatabase();
    const stmt = db.prepare("SELECT d.*, (SELECT COALESCE(SUM(download_count),0) FROM downloads WHERE order_id = d.order_id) AS download_count FROM downloads d WHERE order_id = ? ORDER BY expires_at DESC LIMIT 1");
    const row = await stmt.get(orderId) as unknown as DownloadRow | undefined;
    return row ? mapDownloadRow(row) : null;
}
export async function incrementDownloadCount(id: string): Promise<Download | null> {
    const db = await getDatabase();
    return db.transaction(async () => {
        const linked = await db.prepare("SELECT order_id FROM downloads WHERE id = ?").get(id) as { order_id: string } | undefined;
        if (!linked) return null;
        await db.lockOrder(linked.order_id);
    const now = new Date().toISOString();
    const stmt = db.prepare(`
    UPDATE downloads
    SET download_count = download_count + 1, last_used_at = ?
    WHERE id = ? AND (SELECT COALESCE(SUM(d.download_count),0) FROM downloads d WHERE d.order_id = downloads.order_id) < max_downloads AND expires_at > ?
      AND EXISTS (SELECT 1 FROM orders WHERE orders.id = downloads.order_id AND status = 'paid')
  `);
    const result = await stmt.run(now, id, now);
    if (result.changes !== 1)
        return null;
    const getStmt = db.prepare("SELECT * FROM downloads WHERE id = ?");
    const row = await getStmt.get(id) as unknown as DownloadRow | undefined;
    return row ? mapDownloadRow(row) : null;
    });
}
export async function resetDownloadCount(orderId: string, newMax = 5): Promise<Download | null> {
    const db = await getDatabase();
    return db.transaction(async () => {
        await db.lockOrder(orderId);
    if (!Number.isSafeInteger(newMax) || newMax < 1 || newMax > 100)
        throw new Error("Download limit must be between 1 and 100");
    const stmt = db.prepare(`
    UPDATE downloads
    SET download_count = 0, max_downloads = ?
    WHERE order_id = ?
  `);
    await stmt.run(newMax, orderId);
    return await getDownloadByOrderId(orderId);
    });
}
// Refunds
interface RefundRow {
    id: string;
    order_id: string;
    amount: number;
    currency: string;
    reason: string | null;
    created_at: string;
}
export async function recordRefund(data: Omit<Refund, "createdAt">): Promise<Refund> {
    const db = await getDatabase();
    return db.transaction(async () => {
        await db.lockOrder(data.orderId);
    const createdAt = new Date().toISOString();
    const stmt = db.prepare(`
    INSERT INTO refunds (id, order_id, amount, currency, reason, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
    await stmt.run(data.id, data.orderId, data.amount, data.currency, data.reason ?? null, createdAt);
    // Update order status to refunded
    await updateOrderStatus(data.orderId, "refunded");
    return {
        ...data,
        createdAt,
    };
    });
}
export async function getRefundsByOrderId(orderId: string): Promise<Refund[]> {
    const db = await getDatabase();
    const stmt = db.prepare("SELECT * FROM refunds WHERE order_id = ? ORDER BY created_at DESC");
    const rows = await stmt.all(orderId) as unknown as RefundRow[];
    return rows.map((r) => ({
        id: r.id,
        orderId: r.order_id,
        amount: Number(r.amount),
        currency: r.currency as Currency,
        reason: r.reason ?? undefined,
        createdAt: r.created_at,
    }));
}
// Webhook Idempotency
export async function hasWebhookEventBeenProcessed(gateway: string, eventId: string): Promise<boolean> {
    const db = await getDatabase();
    const stmt = db.prepare("SELECT id FROM webhook_events WHERE gateway = ? AND event_id = ?");
    const row = await stmt.get(gateway, eventId);
    return Boolean(row);
}
export async function recordWebhookEvent(gateway: string, eventId: string, payload: Record<string, unknown> | string): Promise<WebhookEvent> {
    const db = await getDatabase();
    const id = `wh_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const payloadStr = typeof payload === "string" ? payload : JSON.stringify(payload);
    const processedAt = new Date().toISOString();
    const stmt = db.prepare(`
    INSERT INTO webhook_events (id, gateway, event_id, payload, processed_at)
    VALUES (?, ?, ?, ?, ?) ON CONFLICT(gateway, event_id) DO NOTHING
  `);
    await stmt.run(id, gateway, eventId, payloadStr, processedAt);
    return {
        id,
        gateway,
        eventId,
        payload: payloadStr,
        processedAt,
    };
}
// Admin / Metrics
export interface MarketplaceStats {
    totalOrders: number;
    paidOrders: number;
    totalRevenueBDT: number;
    totalRevenueUSD: number;
    totalDownloadsServed: number;
    refundedOrders: number;
}
export async function getMarketplaceStats(): Promise<MarketplaceStats> {
  const db = await getDatabase();
  const [totals, downloads] = await Promise.all([
    db.prepare(`SELECT COUNT(*) AS total,
      SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) AS paid,
      SUM(CASE WHEN status = 'refunded' THEN 1 ELSE 0 END) AS refunded,
      SUM(CASE WHEN status = 'paid' AND currency = 'BDT' THEN amount ELSE 0 END) AS bdt,
      SUM(CASE WHEN status = 'paid' AND currency = 'USD' THEN amount ELSE 0 END) AS usd FROM orders`).get(),
    db.prepare("SELECT SUM(download_count) AS total FROM downloads").get(),
  ]);
  return { totalOrders: Number(totals?.total || 0), paidOrders: Number(totals?.paid || 0),
    refundedOrders: Number(totals?.refunded || 0), totalRevenueBDT: Number(totals?.bdt || 0),
    totalRevenueUSD: Number(totals?.usd || 0), totalDownloadsServed: Number(downloads?.total || 0) };
}
// Durable payment settlement and receipt delivery state.
export async function completeVerifiedPayment(orderId: string, gateway: string, reference: string, paidAt?: string): Promise<Order> {
    const db = await getDatabase();
    return db.transaction(async () => {
        await db.lockOrder(orderId);
        const order = await getOrderById(orderId);
        if (!order || order.gateway !== gateway || order.status === "refunded")
            throw new Error("Order cannot be settled");
        const existing = await db.prepare("SELECT order_id FROM payment_transactions WHERE gateway = ? AND reference = ?").get(gateway, reference) as {
            order_id: string;
        } | undefined;
        if (existing && existing.order_id !== orderId)
            throw new Error("Payment transaction already belongs to another order");
        if (order.status !== "paid") {
            if (order.gatewayReference) await db.prepare("INSERT INTO payment_sessions(order_id, reference) VALUES (?, ?) ON CONFLICT(order_id) DO NOTHING").run(order.id, order.gatewayReference);
            await db.prepare("INSERT INTO payment_transactions(gateway, reference, order_id) VALUES (?, ?, ?)").run(gateway, reference, orderId);
            await updateOrderStatus(orderId, "paid", reference, paidAt);
        }
        await db.prepare("INSERT INTO receipt_delivery(order_id) VALUES (?) ON CONFLICT(order_id) DO NOTHING").run(orderId);
        return (await getOrderById(orderId))!;
    });
}
export async function claimReceipt(orderId: string): Promise<boolean> {
    const db = await getDatabase();
    const result = await db.prepare("UPDATE receipt_delivery SET state = 'sending', leased_until = ? WHERE order_id = ? AND state != 'sent' AND leased_until < ?")
        .run(Date.now() + 120000, orderId, Date.now());
    return result.changes === 1;
}
export async function finishReceipt(orderId: string, success: boolean): Promise<void> {
    const db = await getDatabase();
    await db.prepare("UPDATE receipt_delivery SET state = ?, leased_until = 0 WHERE order_id = ?").run(success ? "sent" : "pending", orderId);
}
export async function listPendingReceipts(): Promise<Order[]> {
    const db = await getDatabase();
    const rows = await db.prepare("SELECT o.* FROM orders o JOIN receipt_delivery r ON o.id = r.order_id WHERE o.status = 'paid' AND r.state != 'sent' AND r.leased_until < ? LIMIT 100").all(Date.now()) as unknown as OrderRow[];
    return rows.map(mapOrderRow);
}

export async function listStalePendingOrders(ageMinutes = 10): Promise<Order[]> {
  const db = await getDatabase();
  return db.transaction(async () => {
    // Serialize batch selection across workers, then rotate even failed/abandoned checks.
    await db.prepare("INSERT INTO reconciliation_batches(id, touched_at) VALUES (1, 0) ON CONFLICT(id) DO NOTHING").run();
    await db.prepare("UPDATE reconciliation_batches SET touched_at = ? WHERE id = 1").run(Date.now());
    const rows = await db.prepare(`SELECT o.* FROM orders o LEFT JOIN reconciliation_checks c ON c.order_id = o.id
      WHERE o.status = 'pending' AND o.gateway != 'sandbox' AND o.created_at < ?
      ORDER BY COALESCE(c.checked_at, 0), o.created_at, o.id LIMIT 100`)
      .all(new Date(Date.now() - ageMinutes * 60000).toISOString()) as unknown as OrderRow[];
    for (const row of rows) await db.prepare(`INSERT INTO reconciliation_checks(order_id, checked_at) VALUES (?, ?)
      ON CONFLICT(order_id) DO UPDATE SET checked_at = excluded.checked_at`).run(row.id, Date.now());
    return rows.map(mapOrderRow);
  });
}

export async function getGatewaySessionReference(orderId: string): Promise<string | undefined> {
  const db = await getDatabase();
  const row = await db.prepare("SELECT reference FROM payment_sessions WHERE order_id = ?").get(orderId);
  return row?.reference as string | undefined;
}

export async function claimRefundAttempt(orderId: string, reason: string): Promise<boolean> {
  const db = await getDatabase();
  return db.transaction(async () => {
    await db.lockOrder(orderId);
    const order = await getOrderById(orderId);
    if (!order || order.status !== "paid") return false;
    const now = new Date().toISOString();
    const result = await db.prepare(`INSERT INTO refund_attempts(order_id, state, reason, created_at, updated_at)
      VALUES (?, 'processing', ?, ?, ?) ON CONFLICT(order_id) DO NOTHING`).run(orderId, reason, now, now);
    return result.changes === 1;
  });
}

export async function markRefundForReview(orderId: string, detail: string, gatewayReference?: string): Promise<void> {
  const db = await getDatabase();
  await db.prepare("UPDATE refund_attempts SET state = 'review', detail = ?, gateway_reference = ?, updated_at = ? WHERE order_id = ? AND state != 'completed'")
    .run(detail, gatewayReference || null, new Date().toISOString(), orderId);
}

export async function completeRefundAttempt(orderId: string, gatewayReference?: string): Promise<Refund> {
  const db = await getDatabase();
  return db.transaction(async () => {
    await db.lockOrder(orderId);
    const order = await getOrderById(orderId);
    const attempt = await db.prepare("SELECT state, reason FROM refund_attempts WHERE order_id = ?").get(orderId);
    if (!order || order.status !== "paid" || !attempt || attempt.state !== "processing") throw new Error("Refund requires merchant reconciliation");
    const refund = await recordRefund({ id: `refund:${orderId}`, orderId, amount: order.amount, currency: order.currency, reason: String(attempt.reason) });
    await db.prepare("UPDATE refund_attempts SET state = 'completed', gateway_reference = ?, updated_at = ? WHERE order_id = ?")
      .run(gatewayReference || null, new Date().toISOString(), orderId);
    return refund;
  });
}

export async function recordConfirmedMerchantRefund(orderId: string, reference: string, evidence: string): Promise<Refund> {
  const db = await getDatabase();
  return db.transaction(async () => {
    await db.lockOrder(orderId);
    const order = await getOrderById(orderId);
    if (!order) throw new Error("Order not found");
    if (order.status === "refunded") {
      const prior = await getRefundsByOrderId(orderId);
      if (prior[0]) return prior[0];
    }
    if (order.status !== "paid") throw new Error("Only paid orders can have a merchant refund recorded");
    const refund = await recordRefund({ id: `refund:${orderId}`, orderId, amount: order.amount, currency: order.currency, reason: evidence });
    const now = new Date().toISOString();
    await db.prepare(`INSERT INTO refund_attempts(order_id, state, reason, gateway_reference, detail, created_at, updated_at)
      VALUES (?, 'completed', ?, ?, ?, ?, ?) ON CONFLICT(order_id) DO UPDATE SET state = 'completed',
      gateway_reference = excluded.gateway_reference, detail = excluded.detail, updated_at = excluded.updated_at`)
      .run(orderId, evidence, reference, `Merchant-confirmed refund: ${evidence}`, now, now);
    return refund;
  });
}

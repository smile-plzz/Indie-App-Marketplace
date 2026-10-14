import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import type { Order, Download, Refund, WebhookEvent, OrderStatus, Currency } from "./types";

let dbInstance: DatabaseSync | null = null;

export function getDatabasePath(): string {
  if (process.env.NODE_ENV === "test" || process.env.MARKETPLACE_DB_PATH === ":memory:") {
    return ":memory:";
  }
  const configured = process.env.MARKETPLACE_DB_PATH || "./data/marketplace.db";
  return path.resolve(process.cwd(), configured);
}

export function getDatabase(): DatabaseSync {
  if (dbInstance) {
    return dbInstance;
  }

  const dbPath = getDatabasePath();
  if (dbPath !== ":memory:") {
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  const db = new DatabaseSync(dbPath);

  // Enable WAL mode for high concurrency if file-backed
  if (dbPath !== ":memory:") {
    db.exec("PRAGMA journal_mode = WAL;");
  }
  db.exec("PRAGMA foreign_keys = ON;");

  initSchema(db);
  dbInstance = db;
  return db;
}

function initSchema(db: DatabaseSync) {
  db.exec(`
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

    CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(customer_email);
    CREATE INDEX IF NOT EXISTS idx_orders_reference ON orders(reference);
    CREATE INDEX IF NOT EXISTS idx_downloads_token_hash ON downloads(token_hash);
    CREATE INDEX IF NOT EXISTS idx_downloads_order_id ON downloads(order_id);
  `);
}

export function closeDatabase(): void {
  if (dbInstance) {
    try {
      dbInstance.close();
    } catch {
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

export function createOrder(data: Omit<Order, "createdAt">): Order {
  const db = getDatabase();
  const createdAt = new Date().toISOString();
  const stmt = db.prepare(`
    INSERT INTO orders (
      id, reference, customer_email, product_id, product_name,
      release_version, amount, currency, gateway, gateway_reference,
      status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    data.id,
    data.reference,
    data.customerEmail,
    data.productId,
    data.productName,
    data.releaseVersion,
    data.amount,
    data.currency,
    data.gateway,
    data.gatewayReference ?? null,
    data.status,
    createdAt
  );

  return {
    ...data,
    createdAt,
  };
}

export function getOrderById(id: string): Order | null {
  const db = getDatabase();
  const stmt = db.prepare("SELECT * FROM orders WHERE id = ?");
  const row = stmt.get(id) as OrderRow | undefined;
  return row ? mapOrderRow(row) : null;
}

export function getOrderByReference(reference: string): Order | null {
  const db = getDatabase();
  const stmt = db.prepare("SELECT * FROM orders WHERE reference = ?");
  const row = stmt.get(reference) as OrderRow | undefined;
  return row ? mapOrderRow(row) : null;
}

export function getOrdersByEmail(email: string): Order[] {
  const db = getDatabase();
  const stmt = db.prepare("SELECT * FROM orders WHERE customer_email = ? ORDER BY created_at DESC");
  const rows = stmt.all(email.toLowerCase().trim()) as unknown as OrderRow[];
  return rows.map(mapOrderRow);
}

export function listOrders(limit = 100, status?: OrderStatus): Order[] {
  const db = getDatabase();
  if (status) {
    const stmt = db.prepare("SELECT * FROM orders WHERE status = ? ORDER BY created_at DESC LIMIT ?");
    const rows = stmt.all(status, limit) as unknown as OrderRow[];
    return rows.map(mapOrderRow);
  }
  const stmt = db.prepare("SELECT * FROM orders ORDER BY created_at DESC LIMIT ?");
  const rows = stmt.all(limit) as unknown as OrderRow[];
  return rows.map(mapOrderRow);
}

export function updateOrderStatus(
  id: string,
  status: OrderStatus,
  gatewayReference?: string,
  paidAt?: string
): Order | null {
  const db = getDatabase();
  const current = getOrderById(id);
  if (!current) return null;

  const now = new Date().toISOString();
  let paidTimestamp = current.paidAt;
  let refundedTimestamp = current.refundedAt;

  if (status === "paid" && !paidTimestamp) {
    paidTimestamp = paidAt || now;
  } else if (status === "refunded" && !refundedTimestamp) {
    refundedTimestamp = now;
  }

  const finalGatewayRef = gatewayReference !== undefined ? gatewayReference : current.gatewayReference;

  const stmt = db.prepare(`
    UPDATE orders
    SET status = ?, gateway_reference = ?, paid_at = ?, refunded_at = ?
    WHERE id = ?
  `);

  stmt.run(
    status,
    finalGatewayRef ?? null,
    paidTimestamp ?? null,
    refundedTimestamp ?? null,
    id
  );

  return getOrderById(id);
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

export function createDownload(data: Omit<Download, "downloadCount">): Download {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO downloads (id, order_id, token_hash, expires_at, download_count, max_downloads)
    VALUES (?, ?, ?, ?, 0, ?)
  `);

  stmt.run(data.id, data.orderId, data.tokenHash, data.expiresAt, data.maxDownloads);

  return {
    ...data,
    downloadCount: 0,
  };
}

export function getDownloadByTokenHash(tokenHash: string): Download | null {
  const db = getDatabase();
  const stmt = db.prepare("SELECT * FROM downloads WHERE token_hash = ?");
  const row = stmt.get(tokenHash) as DownloadRow | undefined;
  return row ? mapDownloadRow(row) : null;
}

export function getDownloadByOrderId(orderId: string): Download | null {
  const db = getDatabase();
  const stmt = db.prepare("SELECT * FROM downloads WHERE order_id = ? ORDER BY expires_at DESC LIMIT 1");
  const row = stmt.get(orderId) as DownloadRow | undefined;
  return row ? mapDownloadRow(row) : null;
}

export function incrementDownloadCount(id: string): Download | null {
  const db = getDatabase();
  const now = new Date().toISOString();
  const stmt = db.prepare(`
    UPDATE downloads
    SET download_count = download_count + 1, last_used_at = ?
    WHERE id = ?
  `);
  stmt.run(now, id);

  const getStmt = db.prepare("SELECT * FROM downloads WHERE id = ?");
  const row = getStmt.get(id) as DownloadRow | undefined;
  return row ? mapDownloadRow(row) : null;
}

export function resetDownloadCount(orderId: string, newMax = 5): Download | null {
  const db = getDatabase();
  const stmt = db.prepare(`
    UPDATE downloads
    SET download_count = 0, max_downloads = ?
    WHERE order_id = ?
  `);
  stmt.run(newMax, orderId);

  return getDownloadByOrderId(orderId);
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

export function recordRefund(data: Omit<Refund, "createdAt">): Refund {
  const db = getDatabase();
  const createdAt = new Date().toISOString();
  const stmt = db.prepare(`
    INSERT INTO refunds (id, order_id, amount, currency, reason, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    data.id,
    data.orderId,
    data.amount,
    data.currency,
    data.reason ?? null,
    createdAt
  );

  // Update order status to refunded
  updateOrderStatus(data.orderId, "refunded");

  return {
    ...data,
    createdAt,
  };
}

export function getRefundsByOrderId(orderId: string): Refund[] {
  const db = getDatabase();
  const stmt = db.prepare("SELECT * FROM refunds WHERE order_id = ? ORDER BY created_at DESC");
  const rows = stmt.all(orderId) as unknown as RefundRow[];
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
export function hasWebhookEventBeenProcessed(gateway: string, eventId: string): boolean {
  const db = getDatabase();
  const stmt = db.prepare("SELECT id FROM webhook_events WHERE gateway = ? AND event_id = ?");
  const row = stmt.get(gateway, eventId);
  return Boolean(row);
}

export function recordWebhookEvent(
  gateway: string,
  eventId: string,
  payload: Record<string, unknown> | string
): WebhookEvent {
  const db = getDatabase();
  const id = `wh_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const payloadStr = typeof payload === "string" ? payload : JSON.stringify(payload);
  const processedAt = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO webhook_events (id, gateway, event_id, payload, processed_at)
    VALUES (?, ?, ?, ?, ?)
  `);

  stmt.run(id, gateway, eventId, payloadStr, processedAt);

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

export function getMarketplaceStats(): MarketplaceStats {
  const db = getDatabase();
  const orders = listOrders(10000);

  let paidOrders = 0;
  let refundedOrders = 0;
  let totalRevenueBDT = 0;
  let totalRevenueUSD = 0;

  for (const order of orders) {
    if (order.status === "paid") {
      paidOrders++;
      if (order.currency === "BDT") totalRevenueBDT += order.amount;
      if (order.currency === "USD") totalRevenueUSD += order.amount;
    } else if (order.status === "refunded") {
      refundedOrders++;
    }
  }

  const dlStmt = db.prepare("SELECT SUM(download_count) as total FROM downloads");
  const dlRow = dlStmt.get() as { total: number | null } | undefined;
  const totalDownloadsServed = Number(dlRow?.total ?? 0);

  return {
    totalOrders: orders.length,
    paidOrders,
    totalRevenueBDT,
    totalRevenueUSD,
    totalDownloadsServed,
    refundedOrders,
  };
}

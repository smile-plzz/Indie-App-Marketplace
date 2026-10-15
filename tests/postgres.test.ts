import test from "node:test";
import assert from "node:assert/strict";
import { PGlite } from "@electric-sql/pglite";
import { Pool } from "pg";
import { createOrder, getOrderById, completeVerifiedPayment, createDownload, incrementDownloadCount, recordRefund, closeDatabase } from "../src/lib/marketplace/db";

// Execute the production driver's SQL against real PostgreSQL compiled to WASM.
// The fake connection transport avoids credentials and any external service.
test("PostgreSQL schema, transactions, payment binding, quotas and refunds", async () => {
  const postgres = new PGlite();
  const originalConnect = Pool.prototype.connect;
  const originalEnd = Pool.prototype.end;
  Object.assign(process.env, { NODE_ENV: "production", DATABASE_URL: "postgres://test:test@localhost/test" });
  Pool.prototype.connect = (async () => ({
    query: async (sql: string, args: unknown[]) => {
      const result = await postgres.query(sql, args);
      return { rows: result.rows, rowCount: result.affectedRows };
    }, release() {},
  })) as typeof Pool.prototype.connect;
  Pool.prototype.end = (async () => {}) as typeof Pool.prototype.end;
  try {
    const order = await createOrder({ id: "pg-order", reference: "PG-ORDER", customerEmail: "pg@example.com", productId: "demo", productName: "Demo", releaseVersion: "1.0.0", amount: 45000, currency: "BDT", gateway: "sandbox", status: "pending" });
    await completeVerifiedPayment(order.id, "sandbox", "pg-txn");
    await completeVerifiedPayment(order.id, "sandbox", "pg-txn");
    assert.equal((await getOrderById(order.id))?.status, "paid");
    await createDownload({ id: "pg-download", orderId: order.id, tokenHash: "pg-token", expiresAt: new Date(Date.now() + 60000).toISOString(), maxDownloads: 1 });
    assert.ok(await incrementDownloadCount("pg-download"));
    assert.equal(await incrementDownloadCount("pg-download"), null);
    await recordRefund({ id: "pg-refund", orderId: order.id, amount: 45000, currency: "BDT", reason: "Test" });
    assert.equal((await getOrderById(order.id))?.status, "refunded");
    await assert.rejects(() => completeVerifiedPayment(order.id, "sandbox", "pg-txn"), /settled/);
  } finally {
    await closeDatabase();
    Pool.prototype.connect = originalConnect;
    Pool.prototype.end = originalEnd;
    await postgres.close();
  }
});

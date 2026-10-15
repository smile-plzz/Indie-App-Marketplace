import test from "node:test";
import assert from "node:assert/strict";
import { POST as refund } from "../src/app/api/admin/orders/[id]/refund/route";
import { createOrder, closeDatabase, getDatabase, getOrderById, listStalePendingOrders } from "../src/lib/marketplace/db";
import { gatewayRegistry } from "../src/lib/marketplace/gateways/registry";
import { SandboxGateway } from "../src/lib/marketplace/gateways/sandbox";
import type { RefundParams, RefundResult } from "../src/lib/marketplace/gateways/types";
Object.assign(process.env, { NODE_ENV: "test", MARKETPLACE_DB_PATH: ":memory:" });
const makeOrder = (id: string, status: "paid" | "pending" = "paid", gateway = "sandbox") => createOrder({ id, reference: id, customerEmail: "test@example.com", productId: "demo", productName: "Demo", releaseVersion: "1.0.0", amount: 100, currency: "BDT", gateway, status });
const request = () => new Request("http://localhost:3000/api/admin/orders/test/refund", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ reason: "Test refund" }) });

class ControlledGateway extends SandboxGateway {
  calls = 0;
  operation: () => Promise<RefundResult> = async () => ({ success: true, refundReference: "refund-1" });
  override async refund(_params: RefundParams): Promise<RefundResult> { this.calls++; return this.operation(); }
}

test("Concurrent refund requests initiate one gateway refund and persist one record", async () => {
  const gateway = new ControlledGateway();
  let entered!: () => void, release!: () => void;
  const started = new Promise<void>(resolve => { entered = resolve; });
  const waiting = new Promise<void>(resolve => { release = resolve; });
  gateway.operation = async () => { entered(); await waiting; return { success: true, refundReference: "refund-concurrent" }; };
  gatewayRegistry.register(gateway);
  await makeOrder("concurrent-refund");
  const context = { params: Promise.resolve({ id: "concurrent-refund" }) };
  const first = refund(request(), context);
  await started;
  const duplicate = await refund(request(), context);
  assert.equal(duplicate.status, 409);
  assert.equal(gateway.calls, 1);
  release();
  assert.equal((await first).status, 200);
  assert.equal((await getOrderById("concurrent-refund"))?.status, "refunded");
  const db = await getDatabase();
  assert.equal((await db.prepare("SELECT COUNT(*) AS total FROM refunds WHERE order_id = ?").get("concurrent-refund"))?.total, 1);
  assert.equal((await db.prepare("SELECT state FROM refund_attempts WHERE order_id = ?").get("concurrent-refund"))?.state, "completed");
});

test("An uncertain refund outcome remains blocked for merchant reconciliation", async () => {
  const gateway = new ControlledGateway();
  gateway.operation = async () => { throw new Error("Provider timeout after submission"); };
  gatewayRegistry.register(gateway);
  await makeOrder("uncertain-refund");
  const context = { params: Promise.resolve({ id: "uncertain-refund" }) };
  assert.equal((await refund(request(), context)).status, 502);
  assert.equal((await refund(request(), context)).status, 409);
  assert.equal(gateway.calls, 1);
  const db = await getDatabase();
  const attempt = await db.prepare("SELECT state, detail FROM refund_attempts WHERE order_id = ?").get("uncertain-refund");
  assert.equal(attempt?.state, "review");
  assert.match(String(attempt?.detail), /timeout/);
  const confirmed = new Request("http://localhost:3000/api/admin/orders/test/refund", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "record-confirmed", merchantRefundReference: "merchant-refund-1", reason: "Confirmed completed in merchant dashboard" }) });
  assert.equal((await refund(confirmed, context)).status, 200);
  assert.equal(gateway.calls, 1);
  assert.equal((await getOrderById("uncertain-refund"))?.status, "refunded");
  assert.equal((await db.prepare("SELECT state FROM refund_attempts WHERE order_id = ?").get("uncertain-refund"))?.state, "completed");
});

test("Pending reconciliation rotates beyond 100 abandoned transactions", async () => {
  for (let i = 0; i < 101; i++) await makeOrder(`pending-${String(i).padStart(3, "0")}`, "pending", "sslcommerz");
  const db = await getDatabase();
  await db.prepare("UPDATE orders SET created_at = ? WHERE status = 'pending'").run(new Date(Date.now() - 3600000).toISOString());
  const first = await listStalePendingOrders();
  assert.equal(first.length, 100);
  assert.equal(first.some(order => order.id === "pending-100"), false);
  const second = await listStalePendingOrders();
  assert.equal(second[0].id, "pending-100");
  assert.equal((await getOrderById("pending-100"))?.status, "pending");
});
test.after(async () => { await closeDatabase(); });

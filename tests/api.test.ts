import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { POST as checkout } from "../src/app/api/checkout/route";
import { POST as webhook } from "../src/app/api/webhooks/[gateway]/route";
import { GET as orderDetails } from "../src/app/api/orders/[id]/route";
import { GET as orderDownload } from "../src/app/api/orders/[id]/download/route";
import { POST as publish } from "../src/app/api/releases/publish/route";
import { getOrderById, getDatabase, updateOrderStatus, closeDatabase } from "../src/lib/marketplace/db";

Object.assign(process.env, { NODE_ENV: "test", MARKETPLACE_DB_PATH: ":memory:", DOWNLOAD_SECRET: "a-real-test-secret-with-at-least-32-characters" });
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "marketplace-api-"));
process.env.STORAGE_LOCAL_DIR = dir;
fs.mkdirSync(path.join(dir, "demo"));
fs.writeFileSync(path.join(dir, "demo/sandbox-download.txt"), "Sandbox download fixture. This is not an installer.\n");
const request = (url: string, body: unknown) => new Request(`http://localhost:3000${url}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });

test("Purchase API: verified payment, duplicate callback, access and refund", async () => {
  const response = await checkout(request("/api/checkout", { slug: "localflix", email: "buyer@example.com", currency: "BDT", gateway: "sandbox" }));
  assert.equal(response.status, 200);
  const session = await response.json();
  const payload = { orderId: session.orderId, txnId: "integration-transaction", amount: 45000, currency: "BDT", status: "Completed" };
  const context = { params: Promise.resolve({ gateway: "sandbox" }) };
  const bad = await webhook(request("/api/webhooks/sandbox", { ...payload, amount: 1 }), context);
  assert.equal(bad.status, 400);
  assert.equal((await getOrderById(session.orderId))?.status, "pending");
  assert.equal((await webhook(request("/api/webhooks/sandbox", payload), context)).status, 200);
  assert.equal((await webhook(request("/api/webhooks/sandbox", payload), context)).status, 200);
  const db = await getDatabase();
  assert.equal((await db.prepare("SELECT COUNT(*) AS total FROM payment_transactions").get())?.total, 1);
  const orderContext = { params: Promise.resolve({ id: session.orderId }) };
  assert.equal((await orderDetails(new Request(`http://localhost:3000/api/orders/${session.orderId}`), orderContext)).status, 404);
  assert.equal((await orderDownload(new Request(`http://localhost:3000/api/orders/${session.orderId}/download`), orderContext)).status, 401);
  const download = await orderDownload(new Request(`http://localhost:3000/api/orders/${session.orderId}/download?access=${session.accessToken}`), orderContext);
  assert.equal(download.status, 307);
  assert.match(download.headers.get("location") || "", /sig=/);
  await updateOrderStatus(session.orderId, "refunded");
  assert.equal((await webhook(request("/api/webhooks/sandbox", payload), context)).status, 409);
  assert.equal((await orderDownload(new Request(`http://localhost:3000/api/orders/${session.orderId}/download?access=${session.accessToken}`), orderContext)).status, 403);
});

test("Release publishing rejects missing configuration", async () => {
  const saved = process.env.RELEASE_PUBLISH_SECRET;
  delete process.env.RELEASE_PUBLISH_SECRET;
  assert.equal((await publish(request("/api/releases/publish", {}))).status, 503);
  if (saved) process.env.RELEASE_PUBLISH_SECRET = saved;
});

test.after(async () => { await closeDatabase(); fs.rmSync(dir, { recursive: true, force: true }); });

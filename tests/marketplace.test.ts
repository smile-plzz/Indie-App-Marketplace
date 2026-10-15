import test from "node:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
process.env.MARKETPLACE_DB_PATH = ":memory:";
Object.assign(process.env, { NODE_ENV: "test" });
const fixtureDir = fs.mkdtempSync(path.join(os.tmpdir(), "marketplace-test-"));
process.env.STORAGE_LOCAL_DIR = fixtureDir;
fs.mkdirSync(path.join(fixtureDir, "demo"), { recursive: true });
fs.writeFileSync(path.join(fixtureDir, "demo", "sandbox-download.txt"), "Sandbox download fixture. This is not an installer.\n");
import assert from "node:assert/strict";
import { createOrder, getOrderById, getOrderByReference, getOrdersByEmail, updateOrderStatus, resetDownloadCount, recordRefund, recordWebhookEvent, hasWebhookEventBeenProcessed, closeDatabase, } from "../src/lib/marketplace/db";
import { createOrderDownloadRecord, verifyAndConsumeDownload, generateMagicLinkToken, verifyMagicLinkToken, } from "../src/lib/marketplace/delivery";
import { SandboxGateway } from "../src/lib/marketplace/gateways/sandbox";
import { BKashGateway } from "../src/lib/marketplace/gateways/bkash";
import { SSLCommerzGateway } from "../src/lib/marketplace/gateways/sslcommerz";
test("Order creation and retrieval", async () => {
    const orderId = `test_ord_${Date.now()}`;
    const ref = `IAM-TEST-${Date.now()}`;
    const email = "customer@example.com";
    const order = await createOrder({
        id: orderId,
        reference: ref,
        customerEmail: email,
        productId: "localflix",
        productName: "LocalFlix",
        releaseVersion: "v1.2.0",
        amount: 45000,
        currency: "BDT",
        gateway: "sandbox",
        status: "pending",
    });
    assert.strictEqual(order.id, orderId);
    assert.strictEqual(order.status, "pending");
    const byId = await getOrderById(orderId);
    assert.ok(byId);
    assert.strictEqual(byId.customerEmail, email);
    assert.strictEqual(byId.amount, 45000);
    const byRef = await getOrderByReference(ref);
    assert.ok(byRef);
    assert.strictEqual(byRef.id, orderId);
    const byEmail = await getOrdersByEmail(email);
    assert.ok(byEmail.length >= 1);
    assert.strictEqual(byEmail[0].id, orderId);
});
test("Order state machine transitions", async () => {
    const orderId = `test_state_${Date.now()}`;
    await createOrder({
        id: orderId,
        reference: `REF-STATE-${Date.now()}`,
        customerEmail: "state@example.com",
        productId: "localflix",
        productName: "LocalFlix",
        releaseVersion: "v1.2.0",
        amount: 350,
        currency: "USD",
        gateway: "sandbox",
        status: "pending",
    });
    // Transition to paid
    const paidOrder = await updateOrderStatus(orderId, "paid", "txn_12345");
    assert.ok(paidOrder);
    assert.strictEqual(paidOrder.status, "paid");
    assert.strictEqual(paidOrder.gatewayReference, "txn_12345");
    assert.ok(paidOrder.paidAt);
    // Transition to refunded
    const refundedOrder = await updateOrderStatus(orderId, "refunded");
    assert.ok(refundedOrder);
    assert.strictEqual(refundedOrder.status, "refunded");
    assert.ok(refundedOrder.refundedAt);
});
test("Webhook idempotency prevention", async () => {
    const gateway = "sandbox";
    const eventId = `evt_test_${Date.now()}`;
    assert.strictEqual(await hasWebhookEventBeenProcessed(gateway, eventId), false);
    await recordWebhookEvent(gateway, eventId, { test: "payload", status: "success" });
    assert.strictEqual(await hasWebhookEventBeenProcessed(gateway, eventId), true);
});
test("Download token creation, quota tracking, and expiry", async () => {
    const orderId = `test_dl_${Date.now()}`;
    await createOrder({
        id: orderId,
        reference: `REF-DL-${Date.now()}`,
        customerEmail: "download@example.com",
        productId: "localflix",
        productName: "LocalFlix",
        releaseVersion: "v1.2.0",
        amount: 45000,
        currency: "BDT",
        gateway: "sandbox",
        status: "paid",
    });
    // Create download with max 2 downloads
    const { download, plaintextToken } = await createOrderDownloadRecord(orderId, 30, 2);
    assert.strictEqual(download.downloadCount, 0);
    assert.strictEqual(download.maxDownloads, 2);
    // First download
    const res1 = await verifyAndConsumeDownload(plaintextToken);
    assert.strictEqual(res1.valid, true);
    assert.ok(res1.signedUrl);
    // Second download
    const res2 = await verifyAndConsumeDownload(plaintextToken);
    assert.strictEqual(res2.valid, true);
    // Third download should exceed limit
    const res3 = await verifyAndConsumeDownload(plaintextToken);
    assert.strictEqual(res3.valid, false);
    assert.match(res3.error || "", /Download limit reached/);
    // Reset downloads
    const reset = await resetDownloadCount(orderId, 5);
    assert.ok(reset);
    assert.strictEqual(reset.downloadCount, 0);
    assert.strictEqual(reset.maxDownloads, 5);
    // Should succeed again
    const resAfterReset = await verifyAndConsumeDownload(plaintextToken);
    assert.strictEqual(resAfterReset.valid, true);
});
test("Download revocation on refunded order", async () => {
    const orderId = `test_refund_dl_${Date.now()}`;
    await createOrder({
        id: orderId,
        reference: `REF-REFUND-${Date.now()}`,
        customerEmail: "refund@example.com",
        productId: "localflix",
        productName: "LocalFlix",
        releaseVersion: "v1.2.0",
        amount: 45000,
        currency: "BDT",
        gateway: "sandbox",
        status: "paid",
    });
    const { plaintextToken } = await createOrderDownloadRecord(orderId);
    const beforeRefund = await verifyAndConsumeDownload(plaintextToken);
    assert.strictEqual(beforeRefund.valid, true);
    // Record refund
    await recordRefund({
        id: `ref_${Date.now()}`,
        orderId,
        amount: 45000,
        currency: "BDT",
        reason: "Customer request",
    });
    const afterRefund = await verifyAndConsumeDownload(plaintextToken);
    assert.strictEqual(afterRefund.valid, false);
    assert.match(afterRefund.error || "", /refunded/i);
});
test("Magic link generation and verification", () => {
    const email = "user@domain.com";
    const token = generateMagicLinkToken(email, 15);
    const verified = verifyMagicLinkToken(token);
    assert.strictEqual(verified.valid, true);
    assert.strictEqual(verified.email, email);
    // Tampered token
    const tampered = token.slice(0, -4) + "AAAA";
    const tamperedRes = verifyMagicLinkToken(tampered);
    assert.strictEqual(tamperedRes.valid, false);
});
test("Sandbox Gateway adapter creates session and validates payments", async () => {
    const gateway = new SandboxGateway();
    const session = await gateway.createSession({
        orderId: "ord_sbx_1",
        orderReference: "IAM-SBX-1",
        customerEmail: "test@example.com",
        productTitle: "LocalFlix",
        amount: 45000,
        currency: "BDT",
        returnUrl: "http://localhost:3000/store/return",
        cancelUrl: "http://localhost:3000/store/localflix",
        webhookUrl: "http://localhost:3000/api/webhooks/sandbox",
    });
    assert.strictEqual(session.gateway, "sandbox");
    assert.ok(session.redirectUrl.includes("sandbox-checkout"));
    // Verify successful payment
    const verifySuccess = await gateway.verifyPayment({
        orderId: "ord_sbx_1",
        orderReference: "IAM-SBX-1",
        expectedAmount: 45000,
        expectedCurrency: "BDT",
        payload: { txnId: "sbx_txn_success" },
    });
    assert.strictEqual(verifySuccess.success, true);
    assert.strictEqual(verifySuccess.amount, 45000);
    // Detect amount mismatch
    const verifyMismatch = await gateway.verifyPayment({
        orderId: "ord_sbx_1",
        orderReference: "IAM-SBX-1",
        expectedAmount: 45000,
        expectedCurrency: "BDT",
        payload: { amount: 30000, txnId: "sbx_mismatch" },
    });
    assert.strictEqual(verifyMismatch.success, false);
    assert.match(verifyMismatch.failureReason || "", /Amount mismatch/);
    // Detect currency mismatch
    const verifyCurrencyMismatch = await gateway.verifyPayment({
        orderId: "ord_sbx_1",
        orderReference: "IAM-SBX-1",
        expectedAmount: 45000,
        expectedCurrency: "BDT",
        payload: { currency: "USD", txnId: "sbx_curr_mismatch" },
    });
    assert.strictEqual(verifyCurrencyMismatch.success, false);
    assert.match(verifyCurrencyMismatch.failureReason || "", /Currency mismatch/);
    // Refund
    const refundRes = await gateway.refund({
        orderId: "ord_sbx_1",
        gatewayReference: "sbx_txn_success",
        amount: 45000,
        currency: "BDT",
    });
    assert.strictEqual(refundRes.success, true);
});
test("Unconfigured real gateways fail closed", async () => {
    const params = {
        orderId: "unconfigured", orderReference: "REF-UNCONFIGURED", customerEmail: "a@example.com",
        productTitle: "Demo", amount: 100, currency: "BDT" as const,
        returnUrl: "http://localhost:3000", cancelUrl: "http://localhost:3000", webhookUrl: "http://localhost:3000",
    };
    for (const gateway of [new BKashGateway(), new SSLCommerzGateway()]) {
        await assert.rejects(() => gateway.createSession(params), /not configured/);
    }
});
test("Refunded orders cannot be revived", async () => {
    const id = "terminal-refund";
    await createOrder({ id, reference: id, customerEmail: "refund@example.com", productId: "localflix", productName: "Demo", releaseVersion: "v0.0.0", amount: 100, currency: "BDT", gateway: "sandbox", status: "paid" });
    await updateOrderStatus(id, "refunded");
    await assert.rejects(async () => await updateOrderStatus(id, "paid"), /transition/);
});
test("Simultaneous downloads respect the shared order quota", async () => {
    const id = "concurrent-download";
    await createOrder({ id, reference: id, customerEmail: "quota@example.com", productId: "localflix", productName: "Demo", releaseVersion: "v0.0.0", amount: 100, currency: "BDT", gateway: "sandbox", status: "paid" });
    const first = await createOrderDownloadRecord(id, 30, 2);
    const second = await createOrderDownloadRecord(id, 30, 2);
    const results = await Promise.all(Array.from({ length: 8 }, (_, i) => verifyAndConsumeDownload(i % 2 ? first.plaintextToken : second.plaintextToken)));
    assert.equal(results.filter(r => r.valid).length, 2);
});
test("Expired download tokens are rejected", async () => {
    const id = "expired-download";
    await createOrder({ id, reference: id, customerEmail: "expired@example.com", productId: "localflix", productName: "Demo", releaseVersion: "v0.0.0", amount: 100, currency: "BDT", gateway: "sandbox", status: "paid" });
    const { plaintextToken } = await createOrderDownloadRecord(id, -1);
    assert.equal((await verifyAndConsumeDownload(plaintextToken)).valid, false);
});

test.after(async () => { await closeDatabase(); fs.rmSync(fixtureDir, { recursive: true, force: true }); });

import test from "node:test";
import assert from "node:assert/strict";
import { BKashGateway } from "../src/lib/marketplace/gateways/bkash";
import { SSLCommerzGateway } from "../src/lib/marketplace/gateways/sslcommerz";
const params = { orderId: "order-1", orderReference: "ORDER-1", expectedAmount: 45000, expectedCurrency: "BDT" as const, gatewayReference: "payment-1" };

test("bKash binds verified invoice, payment session, amount and currency", async () => {
  const original = globalThis.fetch;
  let payment = { transactionStatus: "Completed", trxID: "txn-1", paymentID: "payment-1", merchantInvoiceNumber: "ORDER-1", amount: "450.00", currency: "BDT" };
  globalThis.fetch = (async (input: RequestInfo | URL) => Response.json(String(input).endsWith("token/grant") ? { id_token: "test-token" } : payment)) as typeof fetch;
  try {
    const gateway = new BKashGateway({ appKey: "test", appSecret: "test", username: "test", password: "test" });
    assert.equal((await gateway.verifyPayment(params)).success, true);
    payment = { ...payment, merchantInvoiceNumber: "OTHER-ORDER" };
    assert.equal((await gateway.verifyPayment(params)).success, false);
    payment = { ...payment, merchantInvoiceNumber: "ORDER-1", currency: "USD" };
    assert.equal((await gateway.verifyPayment(params)).success, false);
    payment = { ...payment, currency: "BDT", amount: "449.00" };
    assert.equal((await gateway.verifyPayment(params)).success, false);
  } finally { globalThis.fetch = original; }
});

test("SSLCommerz reconciliation queries the merchant reference and validates the returned payment", async () => {
  const original = globalThis.fetch;
  let payment = { status: "VALID", tran_id: "ORDER-1", amount: "450.00", currency: "BDT", bank_tran_id: "bank-1" };
  const requests: string[] = [];
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const url = String(input); requests.push(url);
    return Response.json(url.includes("merchantTransID") ? { element: [{ val_id: "validation-1", tran_id: "ORDER-1", status: "VALID" }] } : payment);
  }) as typeof fetch;
  try {
    const gateway = new SSLCommerzGateway({ storeId: "test", storePasswd: "test" });
    assert.equal((await gateway.verifyPayment({ ...params, queryOnly: true })).success, true);
    assert.match(requests[0], /tran_id=ORDER-1/);
    assert.match(requests[1], /val_id=validation-1/);
    payment = { ...payment, tran_id: "OTHER-ORDER" };
    assert.equal((await gateway.verifyPayment({ ...params, queryOnly: true })).success, false);
    payment = { ...payment, tran_id: "ORDER-1", currency: "USD" };
    assert.equal((await gateway.verifyPayment({ ...params, queryOnly: true })).success, false);
  } finally { globalThis.fetch = original; }
});

"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { MarketplaceLayout } from "@/components/marketplace/MarketplaceLayout";
import styles from "@/components/store/store.module.css";
function SandboxCheckoutContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const orderId = searchParams.get("orderId");
    const sessionId = searchParams.get("sessionId");
    const gateway = searchParams.get("gateway") || "sandbox";
    const access = searchParams.get("access") || "";
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    useEffect(() => {
        if (!orderId) {
            setError("No order ID provided in sandbox checkout URL");
            setLoading(false);
            return;
        }
        fetch(`/api/orders/${orderId}?access=${encodeURIComponent(access)}`)
            .then((res) => res.json())
            .then((data) => {
            if (data.error)
                throw new Error(data.error);
            setOrder(data.order);
        })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [orderId, access]);
    const handleSimulatePayment = async (status: "success" | "failed") => {
        if (!order)
            return;
        setProcessing(true);
        setError(null);
        try {
            if (status === "success") {
                // Trigger webhook simulation to process order idempotently
                const webhookRes = await fetch(`/api/webhooks/${gateway}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        orderId: order.id,
                        tran_id: order.reference,
                        amount: order.amount,
                        currency: order.currency,
                        status: "Completed",
                        sessionId,
                        txnId: `sim_txn_${Date.now()}`,
                    }),
                });
                const webhookData = await webhookRes.json();
                if (!webhookRes.ok || !webhookData.success) {
                    throw new Error(webhookData.error || "Webhook simulation failed");
                }
                // Redirect to post-purchase return page
                router.push(`/store/return?orderId=${encodeURIComponent(order.id)}&access=${encodeURIComponent(access)}`);
            }
            else {
                // Simulate failure
                await fetch(`/api/webhooks/${gateway}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        orderId: order.id,
                        tran_id: order.reference,
                        simulateFailure: true,
                        status: "failed",
                        sessionId,
                    }),
                });
                router.push(`/store/return?orderId=${encodeURIComponent(order.id)}&access=${encodeURIComponent(access)}`);
            }
        }
        catch (err: any) {
            setError(err?.message || "Failed to simulate transaction");
            setProcessing(false);
        }
    };
    return (<div className={styles.container}>
      <div style={{ maxWidth: "560px", margin: "40px auto", background: "var(--color-surface)", padding: "32px", borderRadius: "8px", border: "1px solid var(--color-divider)", boxShadow: "var(--shadow-md)" }}>
        <div style={{ display: "inline-block", background: "#fef3c7", color: "#92400e", fontSize: "12px", fontWeight: "700", padding: "4px 8px", borderRadius: "4px", marginBottom: "16px" }}>
          SANDBOX SIMULATOR
        </div>

        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "28px", margin: "0 0 8px", color: "var(--color-text)" }}>
          Simulated Payment Gateway
        </h1>
        <p style={{ fontSize: "14px", color: "var(--color-meta)", margin: "0 0 24px" }}>
          This page simulates an external hosted gateway (such as bKash, SSLCommerz, or Stripe) for development and evaluation.
        </p>

        {loading ? (<div>Loading order details...</div>) : error ? (<div style={{ background: "#fee2e2", color: "#b91c1c", padding: "12px", borderRadius: "4px", fontSize: "14px" }}>
            {error}
          </div>) : order ? (<div>
            <table style={{ width: "100%", fontSize: "14px", borderCollapse: "collapse", marginBottom: "24px" }}>
              <tbody>
                <tr>
                  <td style={{ padding: "8px 0", color: "var(--color-meta)" }}>Product:</td>
                  <td style={{ padding: "8px 0", fontWeight: "600", textAlign: "right" }}>{order.productName}</td>
                </tr>
                <tr>
                  <td style={{ padding: "8px 0", color: "var(--color-meta)" }}>Customer Email:</td>
                  <td style={{ padding: "8px 0", textAlign: "right" }}>{order.customerEmail}</td>
                </tr>
                <tr>
                  <td style={{ padding: "8px 0", color: "var(--color-meta)" }}>Order Reference:</td>
                  <td style={{ padding: "8px 0", textAlign: "right" }}>{order.reference}</td>
                </tr>
                <tr>
                  <td style={{ padding: "8px 0", color: "var(--color-meta)" }}>Total Amount:</td>
                  <td style={{ padding: "8px 0", fontWeight: "700", fontSize: "16px", textAlign: "right" }}>
                    {order.currency === "BDT" ? `BDT ${(order.amount / 100).toFixed(2)}` : `$${(order.amount / 100).toFixed(2)} USD`}
                  </td>
                </tr>
              </tbody>
            </table>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <button className={styles.primaryBtn} disabled={processing} onClick={() => handleSimulatePayment("success")}>
                {processing ? "Processing..." : "Simulate Successful Payment"}
              </button>

              <button className={styles.secondaryBtn} disabled={processing} onClick={() => handleSimulatePayment("failed")} style={{ borderColor: "#ef4444", color: "#ef4444" }}>
                Simulate Payment Failure
              </button>

              <button className={styles.secondaryBtn} disabled={processing} onClick={() => router.push(`/store/${order.productId}`)}>
                Cancel and Return to Store
              </button>
            </div>
          </div>) : null}
      </div>
    </div>);
}
export default function SandboxCheckoutPage() {
    return (<MarketplaceLayout>
      <Suspense fallback={<div style={{ padding: "40px", textAlign: "center" }}>Loading checkout...</div>}>
        <SandboxCheckoutContent />
      </Suspense>
    </MarketplaceLayout>);
}

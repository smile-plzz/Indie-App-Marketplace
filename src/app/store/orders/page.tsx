"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { PublicLayout } from "@/components/PublicLayout";
import styles from "@/components/store/store.module.css";

function OrdersContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [emailInput, setEmailInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      setLoadingOrders(true);
      fetch(`/api/orders/lookup?token=${encodeURIComponent(token)}`)
        .then((res) => res.json())
        .then((data) => {
          if (!data.success) throw new Error(data.error || "Failed to load orders");
          setVerifiedEmail(data.email);
          setOrders(data.orders || []);
        })
        .catch((err) => setTokenError(err.message))
        .finally(() => setLoadingOrders(false));
    }
  }, [token]);

  const handleRequestMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !emailInput.includes("@")) {
      setRequestError("Please enter a valid email address");
      return;
    }

    setSubmitting(true);
    setRequestError(null);

    try {
      const res = await fetch("/api/orders/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setRequestSent(true);
    } catch (err: any) {
      setRequestError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div style={{ maxWidth: "680px", margin: "0 auto" }}>
        <div style={{ marginBottom: "24px" }}>
          <Link
            href="/store"
            style={{
              fontSize: "13px",
              color: "var(--color-meta)",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            ← Back to App Store
          </Link>
        </div>

        <h1 className={styles.title}>Your Purchases & Downloads</h1>
        <p className={styles.subtitle} style={{ marginBottom: "32px" }}>
          Lost your installer or setting up a new computer? Enter your purchase email below to receive a secure link to your download history.
        </p>

        {token ? (
          <div>
            {loadingOrders ? (
              <div style={{ padding: "40px 0", textAlign: "center", color: "var(--color-meta)" }}>
                Verifying access token and retrieving orders...
              </div>
            ) : tokenError ? (
              <div style={{ background: "#fee2e2", color: "#b91c1c", padding: "16px 20px", borderRadius: "6px" }}>
                <strong>Access Error:</strong> {tokenError}
                <div style={{ marginTop: "12px" }}>
                  <button
                    onClick={() => window.location.href = "/store/orders"}
                    className={styles.secondaryBtn}
                    style={{ width: "auto", padding: "8px 16px", fontSize: "13px" }}
                  >
                    Request a New Link
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-divider)", padding: "16px 20px", borderRadius: "6px", marginBottom: "24px" }}>
                  Showing purchases for <strong>{verifiedEmail}</strong>
                </div>

                {orders.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px", color: "var(--color-meta)" }}>
                    No paid orders were found associated with this email address.
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        style={{
                          background: "var(--color-surface)",
                          border: "1px solid var(--color-divider)",
                          borderRadius: "8px",
                          padding: "20px 24px",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                          <div>
                            <h3 style={{ margin: "0 0 4px", fontSize: "18px", color: "var(--color-text)" }}>
                              {order.productName}
                            </h3>
                            <span style={{ fontSize: "12px", color: "var(--color-meta)" }}>
                              Version {order.releaseVersion} • Order {order.reference}
                            </span>
                          </div>
                          <span
                            style={{
                              fontSize: "12px",
                              padding: "2px 8px",
                              borderRadius: "4px",
                              background: order.status === "paid" ? "#dcfce7" : "#fef3c7",
                              color: order.status === "paid" ? "#166534" : "#92400e",
                              fontWeight: "600",
                            }}
                          >
                            {order.status.toUpperCase()}
                          </span>
                        </div>

                        {order.product?.sha256Checksum && (
                          <div style={{ margin: "12px 0", fontSize: "11px", color: "var(--color-meta)", wordBreak: "break-all" }}>
                            SHA-256: <code>{order.product.sha256Checksum}</code>
                          </div>
                        )}

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px", paddingTop: "12px", borderTop: "1px solid var(--color-divider)" }}>
                          <span style={{ fontSize: "12px", color: "var(--color-meta)" }}>
                            {order.download
                              ? `Downloads remaining: ${order.download.maxDownloads - order.download.downloadCount} of ${order.download.maxDownloads}`
                              : "Active download"}
                          </span>

                          {order.status === "paid" && (
                            <a
                              href={`/api/download/${order.id}`}
                              className={styles.primaryBtn}
                              style={{ width: "auto", padding: "8px 18px", fontSize: "13px" }}
                            >
                              Download Installer
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-divider)", padding: "32px", borderRadius: "8px" }}>
            {requestSent ? (
              <div style={{ textAlign: "center", padding: "16px 0" }}>
                <div style={{ fontSize: "36px", marginBottom: "12px" }}>✉️</div>
                <h2 style={{ fontSize: "20px", margin: "0 0 8px", color: "var(--color-text)" }}>Check Your Inbox</h2>
                <p style={{ fontSize: "14px", color: "var(--color-meta)", lineHeight: "1.6", maxWidth: "480px", margin: "0 auto" }}>
                  If you have purchases registered under <strong>{emailInput}</strong>, a secure access link has been sent. The link remains valid for 60 minutes.
                </p>
              </div>
            ) : (
              <form onSubmit={handleRequestMagicLink}>
                <div style={{ marginBottom: "20px" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: "600",
                      marginBottom: "8px",
                      color: "var(--color-text)",
                    }}
                  >
                    Enter your purchase email address:
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      fontSize: "15px",
                      border: "1px solid var(--color-divider)",
                      borderRadius: "6px",
                      background: "var(--color-bg)",
                      color: "var(--color-text)",
                    }}
                  />
                </div>

                {requestError && (
                  <div style={{ background: "#fee2e2", color: "#b91c1c", padding: "10px 14px", borderRadius: "4px", fontSize: "13px", marginBottom: "16px" }}>
                    {requestError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className={styles.primaryBtn}
                  style={{ width: "auto", padding: "12px 24px" }}
                >
                  {submitting ? "Sending..." : "Send Magic Link"}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <PublicLayout>
      <Suspense fallback={<div style={{ textAlign: "center", padding: "64px 0" }}>Loading...</div>}>
        <OrdersContent />
      </Suspense>
    </PublicLayout>
  );
}

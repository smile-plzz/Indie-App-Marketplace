"use client";

import { useState, useEffect } from "react";
import type { Order, OrderStatus } from "@/lib/marketplace/types";
import { formatPrice } from "@/lib/marketplace/catalog";

interface Stats {
  totalOrders: number;
  paidOrders: number;
  totalRevenueBDT: number;
  totalRevenueUSD: number;
  totalDownloadsServed: number;
  refundedOrders: number;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadData = () => {
    setLoading(true);
    fetch("/api/admin/orders")
      .then((res) => res.json())
      .then((data) => {
        if (data.orders) setOrders(data.orders);
        if (data.stats) setStats(data.stats);
      })
      .catch((err) => console.error("Failed to load admin orders:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleResetDownloads = async (orderId: string) => {
    if (!confirm("Are you sure you want to reset downloads for this order to 5?")) return;
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/reset-downloads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ maxDownloads: 5 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setActionMessage("Downloads successfully reset.");
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to reset downloads");
    }
  };

  const handleRefund = async (orderId: string) => {
    const reason = prompt("Enter refund reason:", "Customer requested refund");
    if (reason === null) return;

    try {
      const res = await fetch(`/api/admin/orders/${orderId}/refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setActionMessage("Order refunded successfully and download access revoked.");
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to issue refund");
    }
  };

  const handleResendReceipt = async (orderId: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/resend-receipt`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setActionMessage("Receipt email resent to customer.");
    } catch (err: any) {
      alert(err.message || "Failed to resend receipt");
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = filterStatus === "all" || order.status === filterStatus;
    const query = search.toLowerCase().trim();
    const matchesSearch =
      !query ||
      order.reference.toLowerCase().includes(query) ||
      order.customerEmail.toLowerCase().includes(query) ||
      order.productName.toLowerCase().includes(query);

    return matchesStatus && matchesSearch;
  });

  return (
    <div style={{ padding: "32px", maxWidth: "1200px" }}>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "28px", margin: "0 0 8px", color: "var(--color-text)" }}>
          Store Orders & Operations
        </h1>
        <p style={{ fontSize: "14px", color: "var(--color-meta)", margin: 0 }}>
          Manage customer transactions, download quotas, refunds, and receipt delivery.
        </p>
      </div>

      {actionMessage && (
        <div style={{ background: "#dcfce7", color: "#166534", padding: "12px 16px", borderRadius: "6px", marginBottom: "24px", fontSize: "14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage(null)} style={{ border: "none", background: "transparent", cursor: "pointer", fontWeight: "bold" }}>
            ✕
          </button>
        </div>
      )}

      {/* Metrics Row */}
      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "16px", marginBottom: "32px" }}>
          <div style={{ background: "var(--color-surface)", padding: "16px 20px", borderRadius: "8px", border: "1px solid var(--color-divider)" }}>
            <span style={{ fontSize: "12px", color: "var(--color-meta)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Orders</span>
            <div style={{ fontSize: "24px", fontWeight: "700", color: "var(--color-text)", marginTop: "4px" }}>{stats.totalOrders}</div>
          </div>

          <div style={{ background: "var(--color-surface)", padding: "16px 20px", borderRadius: "8px", border: "1px solid var(--color-divider)" }}>
            <span style={{ fontSize: "12px", color: "var(--color-meta)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Paid Orders</span>
            <div style={{ fontSize: "24px", fontWeight: "700", color: "#16a34a", marginTop: "4px" }}>{stats.paidOrders}</div>
          </div>

          <div style={{ background: "var(--color-surface)", padding: "16px 20px", borderRadius: "8px", border: "1px solid var(--color-divider)" }}>
            <span style={{ fontSize: "12px", color: "var(--color-meta)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Revenue (BDT)</span>
            <div style={{ fontSize: "22px", fontWeight: "700", color: "var(--color-text)", marginTop: "4px" }}>
              BDT {(stats.totalRevenueBDT / 100).toLocaleString()}
            </div>
          </div>

          <div style={{ background: "var(--color-surface)", padding: "16px 20px", borderRadius: "8px", border: "1px solid var(--color-divider)" }}>
            <span style={{ fontSize: "12px", color: "var(--color-meta)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Revenue (USD)</span>
            <div style={{ fontSize: "22px", fontWeight: "700", color: "var(--color-text)", marginTop: "4px" }}>
              ${(stats.totalRevenueUSD / 100).toFixed(2)}
            </div>
          </div>

          <div style={{ background: "var(--color-surface)", padding: "16px 20px", borderRadius: "8px", border: "1px solid var(--color-divider)" }}>
            <span style={{ fontSize: "12px", color: "var(--color-meta)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Downloads Served</span>
            <div style={{ fontSize: "24px", fontWeight: "700", color: "var(--color-text)", marginTop: "4px" }}>{stats.totalDownloadsServed}</div>
          </div>

          <div style={{ background: "var(--color-surface)", padding: "16px 20px", borderRadius: "8px", border: "1px solid var(--color-divider)" }}>
            <span style={{ fontSize: "12px", color: "var(--color-meta)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Refunded</span>
            <div style={{ fontSize: "24px", fontWeight: "700", color: "#ef4444", marginTop: "4px" }}>{stats.refundedOrders}</div>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "20px" }}>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {["all", "paid", "pending", "failed", "refunded"].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              style={{
                fontSize: "12px",
                fontWeight: "600",
                padding: "6px 14px",
                borderRadius: "999px",
                border: "1px solid var(--color-divider)",
                background: filterStatus === s ? "var(--color-text)" : "var(--color-surface)",
                color: filterStatus === s ? "var(--color-bg)" : "var(--color-text)",
                cursor: "pointer",
              }}
            >
              {s.toUpperCase()}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Filter by ref, email, or product..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: "8px 14px",
            fontSize: "13px",
            borderRadius: "6px",
            border: "1px solid var(--color-divider)",
            background: "var(--color-surface)",
            color: "var(--color-text)",
            width: "280px",
          }}
        />
      </div>

      {/* Table */}
      <div style={{ background: "var(--color-surface)", borderRadius: "8px", border: "1px solid var(--color-divider)", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--color-divider)", background: "var(--color-bg)" }}>
              <th style={{ padding: "12px 16px", fontWeight: "600", color: "var(--color-text)" }}>Reference</th>
              <th style={{ padding: "12px 16px", fontWeight: "600", color: "var(--color-text)" }}>Customer Email</th>
              <th style={{ padding: "12px 16px", fontWeight: "600", color: "var(--color-text)" }}>Product</th>
              <th style={{ padding: "12px 16px", fontWeight: "600", color: "var(--color-text)" }}>Amount</th>
              <th style={{ padding: "12px 16px", fontWeight: "600", color: "var(--color-text)" }}>Gateway</th>
              <th style={{ padding: "12px 16px", fontWeight: "600", color: "var(--color-text)" }}>Status</th>
              <th style={{ padding: "12px 16px", fontWeight: "600", color: "var(--color-text)" }}>Date</th>
              <th style={{ padding: "12px 16px", fontWeight: "600", color: "var(--color-text)" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ padding: "32px", textAlign: "center", color: "var(--color-meta)" }}>
                  Loading orders...
                </td>
              </tr>
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: "32px", textAlign: "center", color: "var(--color-meta)" }}>
                  No orders found.
                </td>
              </tr>
            ) : (
              filteredOrders.map((ord) => {
                const priceFormatted = formatPrice(ord.amount, ord.currency);

                return (
                  <tr key={ord.id} style={{ borderBottom: "1px solid var(--color-divider)" }}>
                    <td style={{ padding: "12px 16px", fontFamily: "monospace", fontWeight: "600" }}>{ord.reference}</td>
                    <td style={{ padding: "12px 16px" }}>{ord.customerEmail}</td>
                    <td style={{ padding: "12px 16px" }}>{ord.productName} ({ord.releaseVersion})</td>
                    <td style={{ padding: "12px 16px", fontWeight: "600" }}>{priceFormatted}</td>
                    <td style={{ padding: "12px 16px", textTransform: "uppercase", fontSize: "11px" }}>{ord.gateway}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: "700",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          background:
                            ord.status === "paid"
                              ? "#dcfce7"
                              : ord.status === "pending"
                              ? "#fef3c7"
                              : "#fee2e2",
                          color:
                            ord.status === "paid"
                              ? "#166534"
                              : ord.status === "pending"
                              ? "#92400e"
                              : "#991b1b",
                        }}
                      >
                        {ord.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", color: "var(--color-meta)", fontSize: "12px" }}>
                      {new Date(ord.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", gap: "6px" }}>
                        {ord.status === "paid" && (
                          <>
                            <button
                              onClick={() => handleResetDownloads(ord.id)}
                              title="Reset download count to 0"
                              style={{ padding: "4px 8px", fontSize: "11px", border: "1px solid var(--color-divider)", borderRadius: "4px", background: "var(--color-bg)", cursor: "pointer" }}
                            >
                              Reset DL
                            </button>
                            <button
                              onClick={() => handleResendReceipt(ord.id)}
                              title="Resend receipt email"
                              style={{ padding: "4px 8px", fontSize: "11px", border: "1px solid var(--color-divider)", borderRadius: "4px", background: "var(--color-bg)", cursor: "pointer" }}
                            >
                              Resend
                            </button>
                            <button
                              onClick={() => handleRefund(ord.id)}
                              title="Refund order & revoke download access"
                              style={{ padding: "4px 8px", fontSize: "11px", border: "1px solid #f87171", borderRadius: "4px", background: "#fef2f2", color: "#dc2626", cursor: "pointer" }}
                            >
                              Refund
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

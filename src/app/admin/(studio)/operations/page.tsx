"use client";
import { useEffect, useState } from "react";
import styles from "@/components/admin/admin.module.css";

interface Operations {
  checks: { label: string; ready: boolean }[];
  events: { gateway: string; event_id: string; processed_at: string }[];
  receipts: { state: string; total: number }[];
}
export default function OperationsPage() {
  const [data, setData] = useState<Operations | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function load() {
    try {
      const response = await fetch("/api/admin/operations");
      if (!response.ok) throw new Error("Operations are unavailable. Please retry.");
      setData(await response.json()); setError("");
    } catch (error) { setError(error instanceof Error ? error.message : "Unable to load operations"); }
  }
  useEffect(() => { void load(); }, []);
  async function reconcile() {
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/admin/operations", { method: "POST" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Reconciliation failed");
      setMessage(`${result.settled} payments recovered. ${result.delivered} receipts sent. ${result.pending} payments pending. ${result.failed} receipts need retry.`);
      await load();
    } catch (error) { setError(error instanceof Error ? error.message : "Unable to reconcile"); }
    finally { setBusy(false); }
  }
  return <div>
    <div className={styles.pageHead}><div><p className="kick">Store health</p><h1 className={styles.pageTitle}>Operations</h1><p>Check your services, recover delayed orders, and export your records.</p></div></div>
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 28 }}>
      <button onClick={reconcile} disabled={busy}>{busy ? "Checking payments…" : "Reconcile payments & receipts"}</button>
      <a href="/api/admin/operations?export=orders" download>Export orders CSV</a>
      <button onClick={load}>Refresh</button>
    </div>
    {error && <p role="alert">{error}</p>}{message && <p role="status">{message}</p>}
    {!data && !error && <p role="status">Loading operations…</p>}
    {data && <>
      <section style={{ border: "1px solid var(--color-divider)", borderRadius: 20, padding: 24, marginBottom: 28 }}>
        <h2>Launch readiness</h2><p>Configuration checks only. Run a sandbox purchase before going live.</p>
        {data.checks.map(check => <div key={check.label} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--color-divider)", padding: "14px 0" }}><span>{check.label}</span><span>{check.ready ? "Connected" : "Needs setup"}</span></div>)}
      </section>
      <section style={{ marginBottom: 28 }}><h2>Receipt delivery</h2>{data.receipts.length ? data.receipts.map(item => <p key={item.state}>{item.state}: {item.total}</p>) : <p>No receipts yet.</p>}</section>
      <section><h2>Recent payment events</h2>{data.events.length ? <div style={{ overflowX: "auto" }}><table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}><thead><tr><th>Gateway</th><th>Event</th><th>Processed</th></tr></thead><tbody>{data.events.map(event => <tr key={`${event.gateway}:${event.event_id}`}><td>{event.gateway}</td><td>{event.event_id}</td><td>{new Date(event.processed_at).toLocaleString()}</td></tr>)}</tbody></table></div> : <p>Payment events will appear after your first purchase.</p>}</section>
    </>}
  </div>;
}

"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function CatalogImport({ writable }: { writable: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false), [message, setMessage] = useState("");
  async function importContent() {
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/admin/catalog-import", { method: "POST" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Import failed");
      setMessage(`Created ${result.created} records. Preserved ${result.preserved} existing records. Product listings remain drafts.`);
      router.refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to import content"); }
    finally { setBusy(false); }
  }
  return <section className="plate" style={{ padding: 24, marginBottom: 28 }}>
    <h2>Your GitHub catalog, prepared</h2>
    <p>Import eight app drafts, three unsigned release records, eight pending license reviews, six Medium article summaries, an ElementShot portfolio entry, and missing profile details.</p>
    <p>Every app is priced at $2 / BDT 246.90. Source links and current limitations are included. Existing edits are preserved.</p>
    <button className="btn btn-primary" disabled={!writable || busy} onClick={importContent}>{busy ? "Importing..." : "Import editable entities"}</button>
    {!writable && <p>Connect Sanity to save these records. This preview is not saved content.</p>}
    {message && <p role="status">{message}</p>}
  </section>;
}

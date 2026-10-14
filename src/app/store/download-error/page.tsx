"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { PublicLayout } from "@/components/PublicLayout";
import styles from "@/components/store/store.module.css";

function DownloadErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error") || "The download link could not be verified.";

  return (
    <div style={{ maxWidth: "540px", margin: "40px auto", textAlign: "center", background: "var(--color-surface)", padding: "36px", borderRadius: "8px", border: "1px solid var(--color-divider)" }}>
      <div style={{ fontSize: "36px", marginBottom: "16px" }}>⚠️</div>
      <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "26px", color: "var(--color-text)", margin: "0 0 12px" }}>
        Download Unavailable
      </h1>
      <p style={{ color: "var(--color-meta)", fontSize: "15px", lineHeight: "1.6", margin: "0 0 24px" }}>
        {error}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "center" }}>
        <Link href="/store/orders" className={styles.primaryBtn} style={{ width: "auto", padding: "10px 24px" }}>
          Request a Fresh Download Link
        </Link>
        <Link href="/store" className={styles.secondaryBtn} style={{ width: "auto", padding: "10px 24px" }}>
          Return to App Store
        </Link>
      </div>
    </div>
  );
}

export default function DownloadErrorPage() {
  return (
    <PublicLayout>
      <div className={styles.container}>
        <Suspense fallback={<div style={{ textAlign: "center", padding: "64px 0" }}>Loading...</div>}>
          <DownloadErrorContent />
        </Suspense>
      </div>
    </PublicLayout>
  );
}

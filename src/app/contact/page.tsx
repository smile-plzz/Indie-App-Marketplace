import type { Metadata } from "next";
import { MarketplaceLayout } from "@/components/marketplace/MarketplaceLayout";
import styles from "@/components/store/store.module.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact & Support: Indie App Marketplace",
  description: "Get direct technical support and assistance for your Indie App Marketplace purchases.",
};

export default function ContactPage() {
  return (
    <MarketplaceLayout>
      <div className={styles.container}>
        <div style={{ maxWidth: "760px", margin: "0 auto" }}>
          <div className={styles.kicker}>Support</div>
          <h1 className={styles.title}>Contact & Customer Care</h1>
          <p style={{ fontSize: "16px", color: "var(--color-meta)", marginBottom: "32px", lineHeight: "1.6" }}>
            Have a question about an app, need help installing, or want to report an issue? I read every email and reply personally.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", marginBottom: "40px" }}>
            <div style={{ background: "var(--color-surface)", padding: "24px", borderRadius: "8px", border: "1px solid var(--color-divider)" }}>
              <h3 style={{ margin: "0 0 8px", fontSize: "18px", color: "var(--color-text)" }}>Store & Orders Support</h3>
              <p style={{ fontSize: "14px", color: "var(--color-meta)", lineHeight: "1.6", margin: "0 0 16px" }}>
                For purchase inquiries, re-downloads, payment receipts, or refund requests:
              </p>
              <a
                href="mailto:store@ismailhossain.dev"
                style={{ fontSize: "15px", fontWeight: "600", color: "var(--color-accent-prose)" }}
              >
                store@ismailhossain.dev
              </a>
            </div>

            <div style={{ background: "var(--color-surface)", padding: "24px", borderRadius: "8px", border: "1px solid var(--color-divider)" }}>
              <h3 style={{ margin: "0 0 8px", fontSize: "18px", color: "var(--color-text)" }}>Open-Source Bug Reports</h3>
              <p style={{ fontSize: "14px", color: "var(--color-meta)", lineHeight: "1.6", margin: "0 0 16px" }}>
                Found a software bug or want to submit a pull request? File an issue on GitHub:
              </p>
              <a
                href="https://github.com/smile-plzz"
                target="_blank"
                rel="noreferrer"
                style={{ fontSize: "15px", fontWeight: "600", color: "var(--color-accent-prose)" }}
              >
                github.com/smile-plzz
              </a>
            </div>
          </div>

          <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-divider)", borderRadius: "8px", padding: "28px" }}>
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "22px", margin: "0 0 12px", color: "var(--color-text)" }}>
              Common Support Topics
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", fontSize: "14px", lineHeight: "1.6" }}>
              <div>
                <strong>SmartScreen Warning:</strong> If Windows Defender SmartScreen shows an alert on newly released versions, click "More info" and "Run anyway". You can verify the installer integrity anytime by comparing the SHA-256 checksum shown on the product page.
              </div>
              <div>
                <strong>Lost Download Link:</strong> Visit our <Link href="/store/orders" style={{ color: "var(--color-accent-prose)", textDecoration: "underline" }}>Order Lookup tool</Link> to instantly receive a fresh link to your purchased downloads.
              </div>
              <div>
                <strong>Response Times:</strong> Inquiries are typically answered within 24 to 48 hours.
              </div>
            </div>
          </div>
        </div>
      </div>
    </MarketplaceLayout>
  );
}

import type { Metadata } from "next";
import { MarketplaceLayout } from "@/components/marketplace/MarketplaceLayout";
import styles from "@/components/store/store.module.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy: Indie App Marketplace",
  description: "Privacy policy detailing our minimal data collection and commitment to zero third-party ad tracking.",
};

export default function PrivacyPolicyPage() {
  return (
    <MarketplaceLayout>
      <div className={styles.container}>
        <div style={{ maxWidth: "760px", margin: "0 auto" }}>
          <div className={styles.kicker}>Legal</div>
          <h1 className={styles.title}>Privacy Policy</h1>
          <p style={{ fontSize: "14px", color: "var(--color-meta)", marginBottom: "32px" }}>
            Last updated: October 14, 2026
          </p>

          <div style={{ fontSize: "15px", lineHeight: "1.8", color: "var(--color-text)", display: "flex", flexDirection: "column", gap: "24px" }}>
            <section>
              <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "22px", margin: "0 0 12px" }}>1. Our Commitment to Privacy</h2>
              <p>
                Indie App Marketplace is built on a minimal-data philosophy. We do not use third-party advertising trackers, sell personal data, or bundle analytics in our Windows applications.
              </p>
            </section>

            <section>
              <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "22px", margin: "0 0 12px" }}>2. Data We Collect</h2>
              <ul style={{ paddingLeft: "24px" }}>
                <li><strong>Email address:</strong> Collected during checkout to email your order receipt, download link, and release notifications.</li>
                <li><strong>Order metadata:</strong> Order reference ID, purchased product, amount, currency, timestamp, and gateway reference ID.</li>
                <li><strong>No payment card data:</strong> Credit card and mobile wallet credentials are submitted directly to PCI-compliant payment gateways (e.g. bKash, SSLCommerz). Our servers never see or store your payment details.</li>
              </ul>
            </section>

            <section>
              <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "22px", margin: "0 0 12px" }}>3. Data Within Downloaded Applications</h2>
              <p>
                Our desktop software applications (including LocalFlix, HDDCacheWarmer, Safe-Gaming-Optimizer, and PhotoManagementApp) operate 100% offline. They do not transmit telemetry, usage analytics, personal files, or watch history back to our servers or third parties.
              </p>
            </section>

            <section>
              <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "22px", margin: "0 0 12px" }}>4. Data Retention and Deletion</h2>
              <p>
                We retain order and download records for transaction verification, tax compliance, and license maintenance. You can request deletion of your email from our records by contacting <Link href="/contact" style={{ color: "var(--color-accent-prose)" }}>store@ismailhossain.dev</Link>.
              </p>
            </section>
          </div>
        </div>
      </div>
    </MarketplaceLayout>
  );
}

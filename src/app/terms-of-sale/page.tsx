import type { Metadata } from "next";
import { MarketplaceLayout } from "@/components/marketplace/MarketplaceLayout";
import styles from "@/components/store/store.module.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Sale: Indie App Marketplace",
  description: "Terms and conditions governing the purchase of pre-built software installers on Indie App Marketplace.",
};

export default function TermsOfSalePage() {
  return (
    <MarketplaceLayout>
      <div className={styles.container}>
        <div style={{ maxWidth: "760px", margin: "0 auto" }}>
          <div className={styles.kicker}>Legal</div>
          <h1 className={styles.title}>Terms of Sale</h1>
          <p style={{ fontSize: "14px", color: "var(--color-meta)", marginBottom: "32px" }}>
            Last updated: October 14, 2026
          </p>

          <div style={{ fontSize: "15px", lineHeight: "1.8", color: "var(--color-text)", display: "flex", flexDirection: "column", gap: "24px" }}>
            <section>
              <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "22px", margin: "0 0 12px" }}>1. Introduction</h2>
              <p>
                These Terms of Sale govern your purchase of ready-to-run desktop software installers on Indie App Marketplace, operated by Ismail Hossain. By purchasing a product through this website, you agree to these terms.
              </p>
            </section>

            <section>
              <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "22px", margin: "0 0 12px" }}>2. What You Are Purchasing</h2>
              <p>
                The underlying source code of our applications is open-source and free to inspect, modify, and build in accordance with each application's public license (MIT or Apache-2.0).
              </p>
              <p>
                When you pay a fee on this store, you are purchasing:
              </p>
              <ul style={{ paddingLeft: "24px" }}>
                <li>A verified, code-signed, ready-to-run Windows installer package (.exe).</li>
                <li>Direct time-limited and refreshable download access with SHA-256 verification.</li>
                <li>Direct email notifications and download access for future updates.</li>
                <li>Direct email technical support from the developer.</li>
              </ul>
            </section>

            <section>
              <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "22px", margin: "0 0 12px" }}>3. Delivery of Digital Goods</h2>
              <p>
                Upon verified payment through an authorized gateway (such as bKash, SSLCommerz, or Sandbox), you will immediately receive a time-limited download link on screen and via email to the address provided at checkout. You are granted up to five (5) initial downloads per purchase. If you require additional downloads or a link reset, you may request one via the <Link href="/store/orders" style={{ color: "var(--color-accent-prose)" }}>orders lookup page</Link> or contact support.
              </p>
            </section>

            <section>
              <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "22px", margin: "0 0 12px" }}>4. Refunds</h2>
              <p>
                Please review our <Link href="/refund-policy" style={{ color: "var(--color-accent-prose)" }}>Refund Policy</Link> for full details. If an application fails to run on your compatible Windows system or does not meet expectations, you may request a refund within 14 days of purchase.
              </p>
            </section>

            <section>
              <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "22px", margin: "0 0 12px" }}>5. Disclaimer and Warranties</h2>
              <p>
                The software is provided "as is", without warranty of any kind, express or implied. In no event shall the author or copyright holders be liable for any claim, damages, or other liability arising from the use of the software.
              </p>
            </section>

            <section>
              <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "22px", margin: "0 0 12px" }}>6. Contact Information</h2>
              <p>
                For questions regarding your order or these terms, please contact: <Link href="/contact" style={{ color: "var(--color-accent-prose)" }}>store@ismailhossain.dev</Link>.
              </p>
            </section>
          </div>
        </div>
      </div>
    </MarketplaceLayout>
  );
}

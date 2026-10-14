import type { Metadata } from "next";
import { PublicLayout } from "@/components/PublicLayout";
import styles from "@/components/store/store.module.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Refund Policy: Indie App Marketplace",
  description: "Simple, fair 14-day refund policy for software purchases on Indie App Marketplace.",
};

export default function RefundPolicyPage() {
  return (
    <PublicLayout>
      <div className={styles.container}>
        <div style={{ maxWidth: "760px", margin: "0 auto" }}>
          <div className={styles.kicker}>Customer Care</div>
          <h1 className={styles.title}>Refund Policy</h1>
          <p style={{ fontSize: "14px", color: "var(--color-meta)", marginBottom: "32px" }}>
            Last updated: October 14, 2026
          </p>

          <div style={{ fontSize: "15px", lineHeight: "1.8", color: "var(--color-text)", display: "flex", flexDirection: "column", gap: "24px" }}>
            <section>
              <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "22px", margin: "0 0 12px" }}>14-Day Money-Back Guarantee</h2>
              <p>
                We want you to be completely satisfied with your purchase. Because our source code is open and freely available, paying for an installer represents your trust and support.
              </p>
              <p>
                If any purchased application does not work as advertised on your computer, crashes, or fails to meet your expectations, you may request a <strong>100% full refund within 14 days of your purchase date</strong>.
              </p>
            </section>

            <section>
              <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "22px", margin: "0 0 12px" }}>How to Request a Refund</h2>
              <ol style={{ paddingLeft: "24px", display: "flex", flexDirection: "column", gap: "8px" }}>
                <li>Email <strong>store@ismailhossain.dev</strong> from the email address used during purchase.</li>
                <li>Include your Order Reference number (e.g., <code>IAM-20261014-XXXXX</code>).</li>
                <li>Optionally tell us what went wrong (this helps us improve future releases).</li>
              </ol>
            </section>

            <section>
              <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "22px", margin: "0 0 12px" }}>Refund Processing</h2>
              <p>
                Refunds are processed promptly within 2 business days. The refund is credited back to your original payment method (bKash wallet, card, or bank account).
              </p>
              <p>
                Once an order is refunded, the associated download links and update tokens are revoked.
              </p>
            </section>

            <div style={{ marginTop: "16px" }}>
              <Link href="/contact" className={styles.primaryBtn} style={{ width: "auto", display: "inline-block" }}>
                Contact Support for a Refund
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

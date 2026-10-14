import type { Metadata } from "next";
import Link from "next/link";
import { MarketplaceLayout } from "@/components/marketplace/MarketplaceLayout";
import { getAllProducts } from "@/lib/marketplace/catalog";
import { StoreCatalog } from "@/components/store/StoreCatalog";
import styles from "@/components/store/store.module.css";

export const metadata: Metadata = {
  title: "Indie App Marketplace: Open-Source Windows Software by Ismail",
  description:
    "A personal storefront and showcase for open-source Windows tools. Free source code on GitHub; convenient, signed, ready-to-run installers available.",
};

export default async function MarketplaceHomePage() {
  const products = await getAllProducts();

  return (
    <MarketplaceLayout>
      <div className={styles.container}>
        {/* Hero Section */}
        <div className={styles.hero} style={{ textAlign: "center", maxWidth: "860px", margin: "0 auto 48px" }}>
          <div className={styles.kicker}>Personal Showcase & Storefront</div>
          <h1 className={styles.title} style={{ fontSize: "clamp(34px, 5.5vw, 52px)" }}>
            Indie Windows Tools, Open-Source & Ready to Run
          </h1>
          <p className={styles.subtitle} style={{ margin: "0 auto", fontSize: "18px", maxWidth: "720px" }}>
            I build fast, privacy-first desktop applications for Windows with zero telemetry.
            Every tool is completely open-source on GitHub; this store provides ready-to-run, code-signed installers with automatic updates and direct email support.
          </p>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "12px",
              justifyContent: "center",
              marginTop: "24px",
            }}
          >
            <span className={styles.badge} style={{ padding: "6px 14px", fontSize: "13px" }}>
              ✓ 100% Open-Source (MIT & Apache)
            </span>
            <span className={styles.badge} style={{ padding: "6px 14px", fontSize: "13px" }}>
              ✓ Offline-First (No Telemetry)
            </span>
            <span className={styles.badge} style={{ padding: "6px 14px", fontSize: "13px" }}>
              ✓ SHA-256 Checksums
            </span>
            <span className={styles.badge} style={{ padding: "6px 14px", fontSize: "13px" }}>
              ✓ 14-Day Refund Guarantee
            </span>
          </div>

          <div className={styles.ethosCallout} style={{ textAlign: "left", marginTop: "32px" }}>
            <strong>The Convenience Model:</strong> The fee is for convenience, code-signed binaries, malware-scanned releases, updates, and support, not for locking up the code. The free "build it yourself from GitHub" route is permanently available on every single app page.
          </div>
        </div>

        {/* Live Catalog & Search */}
        <div id="catalog" style={{ scrollMarginTop: "90px", marginBottom: "64px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "20px" }}>
            <div>
              <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "28px", margin: "0 0 4px", color: "var(--color-text)" }}>
                Applications & Utilities
              </h2>
              <p style={{ fontSize: "14px", color: "var(--color-meta)", margin: 0 }}>
                Select an app to view features, system requirements, checksums, or source code.
              </p>
            </div>
          </div>

          <StoreCatalog products={products} />
        </div>

        {/* Featured Showcase Spotlights */}
        <div className={styles.sectionBlock}>
          <div style={{ textAlign: "center", maxWidth: "700px", margin: "0 auto 40px" }}>
            <div className={styles.kicker}>Featured Spotlight</div>
            <h2 className={styles.sectionHeading} style={{ fontSize: "32px", margin: "0 0 12px" }}>
              Crafted for Performance & Privacy
            </h2>
            <p style={{ fontSize: "15px", color: "var(--color-meta)", margin: 0 }}>
              Deep dive into some of our most popular desktop utilities.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
            {products.slice(0, 3).map((prod) => (
              <div
                key={prod.id}
                style={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-divider)",
                  borderRadius: "12px",
                  padding: "32px",
                  display: "grid",
                  gridTemplateColumns: "1.2fr 1fr",
                  gap: "32px",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
                    <span className={`${styles.badge} ${styles.badgeAccent}`}>{prod.category}</span>
                    <span className={styles.badge}>{prod.currentVersion}</span>
                    <span className={styles.badge}>{prod.license} License</span>
                  </div>

                  <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "28px", margin: "0 0 12px", color: "var(--color-text)" }}>
                    {prod.title}
                  </h3>
                  <p style={{ fontSize: "15px", color: "var(--color-meta)", lineHeight: "1.6", margin: "0 0 20px" }}>
                    {prod.description}
                  </p>

                  <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                    <Link href={`/store/${prod.slug}`} className={styles.primaryBtn} style={{ width: "auto", padding: "10px 22px" }}>
                      View Product & Download
                    </Link>
                    <a
                      href={prod.repoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className={styles.secondaryBtn}
                      style={{ width: "auto", padding: "9px 20px" }}
                    >
                      GitHub Source (Free)
                    </a>
                  </div>
                </div>

                <div
                  style={{
                    background: "var(--color-bg)",
                    border: "1px solid var(--color-divider)",
                    borderRadius: "8px",
                    padding: "24px",
                  }}
                >
                  <strong style={{ fontSize: "14px", color: "var(--color-text)", display: "block", marginBottom: "12px" }}>
                    Key Highlights:
                  </strong>
                  <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "13px", color: "var(--color-meta)", lineHeight: "1.7" }}>
                    {prod.features.slice(0, 3).map((f, i) => (
                      <li key={i}>
                        <strong style={{ color: "var(--color-text)" }}>{f.title}:</strong> {f.description}
                      </li>
                    ))}
                  </ul>

                  <div style={{ marginTop: "16px", paddingTop: "12px", borderTop: "1px solid var(--color-divider)", fontSize: "11px", color: "var(--color-meta)", wordBreak: "break-all" }}>
                    SHA-256: <code>{prod.sha256Checksum}</code>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Why Buy from Marketplace vs Free Route */}
        <div className={styles.sectionBlock}>
          <div style={{ textAlign: "center", maxWidth: "680px", margin: "0 auto 32px" }}>
            <h2 className={styles.sectionHeading}>What Does the Convenience Fee Cover?</h2>
            <p style={{ fontSize: "15px", color: "var(--color-meta)" }}>
              We do not lock away code. Here is an honest breakdown of the two paths:
            </p>
          </div>

          <table className={styles.comparisonTable}>
            <thead>
              <tr>
                <th>Feature</th>
                <th>Paid Installer on Store</th>
                <th>Free Route on GitHub</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Source Code</strong></td>
                <td>Full access (MIT / Apache)</td>
                <td>Full access (MIT / Apache)</td>
              </tr>
              <tr>
                <td><strong>Installation</strong></td>
                <td>One-click setup package (.exe)</td>
                <td>Requires Git, compiler & tooling</td>
              </tr>
              <tr>
                <td><strong>Security Check</strong></td>
                <td>Code-signed, malware scanned, SHA-256 hash</td>
                <td>Self-compiled binary</td>
              </tr>
              <tr>
                <td><strong>Updates</strong></td>
                <td>Email notification & direct download link</td>
                <td>Manual git pull & local rebuild</td>
              </tr>
              <tr>
                <td><strong>Support</strong></td>
                <td>Direct 1-on-1 developer email support</td>
                <td>GitHub issue tracker community</td>
              </tr>
              <tr>
                <td><strong>Pricing</strong></td>
                <td>Small convenience fee (BDT / USD)</td>
                <td>$0 (Free forever)</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Re-download order lookup callout */}
        <div
          style={{
            marginTop: "64px",
            background: "var(--color-surface)",
            border: "1px solid var(--color-divider)",
            borderRadius: "12px",
            padding: "36px",
            textAlign: "center",
          }}
        >
          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "24px", margin: "0 0 8px", color: "var(--color-text)" }}>
            Already Purchased a Tool?
          </h2>
          <p style={{ fontSize: "14px", color: "var(--color-meta)", maxWidth: "520px", margin: "0 auto 20px", lineHeight: "1.6" }}>
            If you need to re-download an installer on a new PC or refresh your download quota, use our instant magic link lookup.
          </p>
          <Link href="/store/orders" className={styles.primaryBtn} style={{ display: "inline-block", width: "auto", padding: "10px 24px" }}>
            Access Your Order History
          </Link>
        </div>
      </div>
    </MarketplaceLayout>
  );
}

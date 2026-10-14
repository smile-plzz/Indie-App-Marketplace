import type { Metadata } from "next";
import { MarketplaceLayout } from "@/components/marketplace/MarketplaceLayout";
import { getAllProducts } from "@/lib/marketplace/catalog";
import { StoreCatalog } from "@/components/store/StoreCatalog";
import styles from "@/components/store/store.module.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "App Store: Independent Windows Tools by Ismail",
  description:
    "Open-source Windows utilities and applications. Source is free on GitHub; convenient, signed, auto-updating installers are available for a small fee.",
};

export default async function StorePage() {
  const products = await getAllProducts();

  return (
    <MarketplaceLayout>
      <div className={styles.container}>
        <div className={styles.hero}>
          <div className={styles.kicker}>Indie App Marketplace</div>
          <h1 className={styles.title}>Open-Source Windows Apps, Ready to Run</h1>
          <p className={styles.subtitle}>
            I build useful, privacy-first desktop tools and publish the code on GitHub. If you want the convenience of a verified, code-signed installer with updates and email support, you can purchase it below for a small fee.
          </p>

          <div className={styles.ethosCallout}>
            <strong>Open-Source Transparency:</strong> Every app listed here has its complete source code available on GitHub for free under MIT or Apache-2.0. You are paying for the convenience of pre-built, signed binaries and verified checksums, not for code lock-in.
          </div>
        </div>

        <StoreCatalog products={products} />

        <div style={{ marginTop: "64px", paddingTop: "24px", borderTop: "1px solid var(--color-divider)", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", fontSize: "13px", color: "var(--color-meta)" }}>
          <div>
            Already purchased an app?{" "}
            <Link href="/store/orders" style={{ color: "var(--color-accent-prose)", textDecoration: "underline" }}>
              Look up your previous downloads
            </Link>
          </div>
          <div style={{ display: "flex", gap: "16px" }}>
            <Link href="/terms-of-sale" style={{ color: "inherit" }}>Terms of Sale</Link>
            <Link href="/refund-policy" style={{ color: "inherit" }}>Refund Policy</Link>
            <Link href="/privacy-policy" style={{ color: "inherit" }}>Privacy</Link>
            <Link href="/license" style={{ color: "inherit" }}>Licenses</Link>
          </div>
        </div>
      </div>
    </MarketplaceLayout>
  );
}

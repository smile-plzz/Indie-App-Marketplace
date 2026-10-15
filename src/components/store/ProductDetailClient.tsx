"use client";
import { useState } from "react";
import type { MarketplaceProduct } from "@/lib/marketplace/types";
import { formatPrice } from "@/lib/marketplace/catalog";
import styles from "./store.module.css";
interface ProductDetailClientProps {
    product: MarketplaceProduct;
    gateways: string[];
}
export function ProductDetailClient({ product, gateways }: ProductDetailClientProps) {
    const [currency, setCurrency] = useState<"BDT" | "USD">("BDT");
    const [showCheckout, setShowCheckout] = useState(false);
    const [email, setEmail] = useState("");
    const [gateway, setGateway] = useState(gateways[0] || "");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const priceFormatted = formatPrice(currency === "USD" ? product.priceUSD : product.priceBDT, currency);
    const handleCopyChecksum = () => {
        navigator.clipboard.writeText(product.sha256Checksum);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    const handleCheckoutSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !email.includes("@")) {
            setError("Please enter a valid email address");
            return;
        }
        if (!gateway) { setError("Checkout is not available yet. Please use the free GitHub route."); return; }
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    slug: product.slug,
                    email,
                    currency,
                    gateway,
                }),
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.error || "Failed to initiate checkout session");
            }
            // Redirect to the gateway session URL
            window.location.href = data.redirectUrl;
        }
        catch (err: any) {
            setError(err?.message || "An unexpected error occurred");
            setLoading(false);
        }
    };
    return (<div>
      <div className={styles.detailHeader}>
        <div className={styles.badgesRow}>
          <span className={`${styles.badge} ${styles.badgeAccent}`}>{product.category}</span>
          <span className={styles.badge}>{product.minOS}</span>
          <span className={styles.badge}>{product.license} License</span>
          <span className={styles.badge}>Version {product.currentVersion}</span>
        </div>

        <h1 className={styles.title}>{product.title}</h1>
        <p className={styles.subtitle}>{product.tagline}</p>
      </div>

      <div className={styles.ctaGrid}>
        {/* Paid Convenience Route */}
        <div className={styles.buyBox}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "14px", fontWeight: "600", color: "var(--color-accent-prose)" }}>
              Ready-to-Run Installer
            </span>
            <div className={styles.currencyToggle}>
              <button className={`${styles.currencyBtn} ${currency === "BDT" ? styles.currencyBtnActive : ""}`} onClick={() => setCurrency("BDT")}>
                BDT
              </button>
              <button className={`${styles.currencyBtn} ${currency === "USD" ? styles.currencyBtnActive : ""}`} onClick={() => setCurrency("USD")}>
                USD
              </button>
            </div>
          </div>

          <div style={{ margin: "16px 0 8px" }}>
            <span style={{ fontSize: "32px", fontWeight: "700", color: "var(--color-text)" }}>
              {priceFormatted}
            </span>
          </div>

          <p style={{ fontSize: "13px", color: "var(--color-meta)", margin: "0 0 16px", lineHeight: "1.5" }}>
            {product.currentVersion === "demo" ? "Sandbox purchase only. Downloads a harmless text fixture, not an installer." : "Includes a signed installer, release checksum, and email support."}
          </p>

          <button className={styles.primaryBtn} onClick={() => setShowCheckout(true)}>
            Buy Verified Installer
          </button>
        </div>

        {/* Free Open Source Route */}
        <div className={styles.freeBox}>
          <span style={{ fontSize: "14px", fontWeight: "600", color: "var(--color-text)" }}>
            Build from Source (100% Free)
          </span>

          <div style={{ margin: "16px 0 8px" }}>
            <span style={{ fontSize: "32px", fontWeight: "700", color: "var(--color-text)" }}>
              Free
            </span>
          </div>

          <p style={{ fontSize: "13px", color: "var(--color-meta)", margin: "0 0 16px", lineHeight: "1.5" }}>
            All source code is publicly available under the {product.license} open-source license. Clone and compile it on your machine anytime.
          </p>

          <a href={product.repoUrl} target="_blank" rel="noreferrer" className={styles.secondaryBtn}>
            View GitHub Repository
          </a>
        </div>
      </div>

      {/* Description & Overview */}
      <div className={styles.sectionBlock}>
        <h2 className={styles.sectionHeading}>About this Application</h2>
        <p style={{ fontSize: "16px", lineHeight: "1.7", color: "var(--color-text)", maxWidth: "800px" }}>
          {product.description}
        </p>
      </div>

      {/* Features Grid */}
      <div className={styles.sectionBlock}>
        <h2 className={styles.sectionHeading}>Key Features</h2>
        <div className={styles.featuresGrid}>
          {product.features.map((feature, i) => (<div key={i} className={styles.featureCard}>
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureDesc}>{feature.description}</p>
            </div>))}
        </div>
      </div>

      {/* Comparison: Convenience vs Free Route */}
      <div className={styles.sectionBlock}>
        <h2 className={styles.sectionHeading}>What You Are Paying For</h2>
        <p style={{ fontSize: "14px", color: "var(--color-meta)", marginBottom: "16px" }}>
          We believe in honest open-source software. You are never forced to pay to use the code.
        </p>
        <table className={styles.comparisonTable}>
          <thead>
            <tr>
              <th>Feature</th>
              <th>Paid Installer</th>
              <th>Free GitHub Route</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Source Code Access</td>
              <td>Full (MIT/Apache)</td>
              <td>Full (MIT/Apache)</td>
            </tr>
            <tr>
              <td>Installation Effort</td>
              <td>One-click setup executable</td>
              <td>Requires git, SDK, build tools</td>
            </tr>
            <tr>
              <td>SmartScreen & Malware Scanned</td>
              <td>Yes, verified build</td>
              <td>Self-compiled</td>
            </tr>
            <tr>
              <td>Version Updates</td>
              <td>Email notification & direct link</td>
              <td>Manual git pull & rebuild</td>
            </tr>
            <tr>
              <td>Direct Email Support</td>
              <td>Included</td>
              <td>GitHub Issues community</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* System Requirements & Security */}
      <div className={styles.sectionBlock}>
        <h2 className={styles.sectionHeading}>System Requirements & Verification</h2>
        <ul style={{ paddingLeft: "20px", color: "var(--color-meta)", fontSize: "15px", lineHeight: "1.8" }}>
          {product.systemRequirements.map((req, i) => (<li key={i}>{req}</li>))}
        </ul>

        <div style={{ marginTop: "24px" }}>
          <p style={{ fontSize: "13px", fontWeight: "600", color: "var(--color-text)", marginBottom: "8px" }}>
            SHA-256 Checksum ({product.currentVersion} Installer):
          </p>
          <div className={styles.checksumBox}>
            <span>{product.sha256Checksum}</span>
            <button className={styles.copyBtn} onClick={handleCopyChecksum}>
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
      </div>

      {/* Changelog */}
      {product.changelog && product.changelog.length > 0 && (<div className={styles.sectionBlock}>
          <h2 className={styles.sectionHeading}>Release History</h2>
          <ul style={{ paddingLeft: "20px", color: "var(--color-meta)", fontSize: "14px", lineHeight: "1.8" }}>
            {product.changelog.map((entry, idx) => (<li key={idx}>{entry}</li>))}
          </ul>
        </div>)}

      {/* FAQ */}
      {product.faq && product.faq.length > 0 && (<div className={styles.sectionBlock}>
          <h2 className={styles.sectionHeading}>Frequently Asked Questions</h2>
          <div>
            {product.faq.map((item, idx) => (<div key={idx} className={styles.faqItem}>
                <div className={styles.faqQuestion}>{item.question}</div>
                <div className={styles.faqAnswer}>{item.answer}</div>
              </div>))}
          </div>
        </div>)}

      {/* Checkout Modal */}
      {showCheckout && (<div className={styles.modalOverlay} onClick={() => !loading && setShowCheckout(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => !loading && setShowCheckout(false)}>
              ×
            </button>

            <h3 style={{ margin: "0 0 8px", fontSize: "20px", color: "var(--color-text)" }}>
              Complete Your Purchase
            </h3>
            <p style={{ fontSize: "14px", color: "var(--color-meta)", margin: "0 0 20px" }}>
              {product.title} - {priceFormatted}
            </p>

            {error && (<div style={{
                    background: "#fee2e2",
                    color: "#b91c1c",
                    padding: "10px 14px",
                    borderRadius: "4px",
                    fontSize: "13px",
                    marginBottom: "16px",
                }}>
                {error}
              </div>)}

            <form onSubmit={handleCheckoutSubmit}>
              <div style={{ marginBottom: "16px" }}>
                <label style={{
                display: "block",
                fontSize: "13px",
                fontWeight: "600",
                marginBottom: "6px",
                color: "var(--color-text)",
            }}>
                  Your Email Address (for download link & receipt):
                </label>
                <input type="email" required placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} style={{
                width: "100%",
                padding: "10px 14px",
                fontSize: "14px",
                border: "1px solid var(--color-divider)",
                borderRadius: "4px",
                background: "var(--color-bg)",
                color: "var(--color-text)",
            }}/>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{
                display: "block",
                fontSize: "13px",
                fontWeight: "600",
                marginBottom: "6px",
                color: "var(--color-text)",
            }}>
                  Payment Method:
                </label>
                <select value={gateway} onChange={(e) => setGateway(e.target.value)} style={{
                width: "100%",
                padding: "10px 14px",
                fontSize: "14px",
                border: "1px solid var(--color-divider)",
                borderRadius: "4px",
                background: "var(--color-bg)",
                color: "var(--color-text)",
            }}>
                  {gateways.map(name => <option key={name} value={name}>{({sandbox: "Sandbox test", bkash: "bKash", sslcommerz: "Cards & mobile wallets"} as Record<string,string>)[name]}</option>)}
                </select>
              </div>

              <button type="submit" className={styles.primaryBtn} disabled={loading} style={{ opacity: loading ? 0.7 : 1 }}>
                {loading ? "Preparing Checkout..." : `Pay ${priceFormatted}`}
              </button>

              <p style={{ fontSize: "12px", color: "var(--color-meta)", textAlign: "center", marginTop: "12px" }}>
                Guest checkout with email. No account creation required.
              </p>
            </form>
          </div>
        </div>)}
    </div>);
}

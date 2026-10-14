import Link from "next/link";
import type { ReactNode } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import styles from "./MarketplaceLayout.module.css";

export function MarketplaceLayout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/" className={styles.brand}>
            <div className={styles.logoBadge}>I</div>
            <div className={styles.brandText}>
              <span className={styles.brandName}>Indie App Marketplace</span>
              <span className={styles.brandSub}>Open-Source Windows Tools</span>
            </div>
          </Link>

          <nav className={styles.nav} aria-label="Marketplace Navigation">
            <Link href="/" className={styles.navLink}>
              Showcase
            </Link>
            <Link href="/#catalog" className={styles.navLink}>
              Browse Apps
            </Link>
            <Link href="/license" className={styles.navLink}>
              Why Open Source?
            </Link>
            <Link href="/store/orders" className={styles.navLink}>
              Lookup Orders
            </Link>
            <Link href="/contact" className={styles.navLink}>
              Support
            </Link>
          </nav>

          <div className={styles.headerActions}>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className={styles.main}>{children}</main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerCol}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <div className={styles.logoBadge} style={{ width: "28px", height: "28px", fontSize: "16px" }}>I</div>
              <strong style={{ fontSize: "16px", color: "var(--color-text)" }}>Indie App Marketplace</strong>
            </div>
            <p style={{ fontSize: "13px", lineHeight: "1.6", color: "var(--color-meta)", margin: "0 0 16px" }}>
              A personal software showcase and storefront for open-source Windows tools. All source code remains 100% free on GitHub. The store sells convenient, ready-to-run, verified installers with automatic updates and email support.
            </p>
            <div style={{ fontSize: "12px", color: "var(--color-accent-prose)" }}>
              Built by Ismail Hossain (smile-plzz)
            </div>
          </div>

          <div className={styles.footerCol}>
            <h4>Applications</h4>
            <ul>
              <li><Link href="/store/localflix">LocalFlix</Link></li>
              <li><Link href="/store/hdd-cache-warmer">HDDCacheWarmer</Link></li>
              <li><Link href="/store/safe-gaming-optimizer">Safe-Gaming-Optimizer</Link></li>
              <li><Link href="/store/photo-management-app">PhotoManagementApp</Link></li>
              <li><Link href="/store/dedupe-light">dedupe-light</Link></li>
            </ul>
          </div>

          <div className={styles.footerCol}>
            <h4>Trust & Verification</h4>
            <ul>
              <li><Link href="/refund-policy">14-Day Refund Guarantee</Link></li>
              <li><Link href="/license">Open-Source License Policy</Link></li>
              <li><Link href="/store/orders">Order & Download Lookup</Link></li>
              <li><Link href="/contact">Direct Developer Support</Link></li>
            </ul>
          </div>

          <div className={styles.footerCol}>
            <h4>Legal</h4>
            <ul>
              <li><Link href="/terms-of-sale">Terms of Sale</Link></li>
              <li><Link href="/privacy-policy">Privacy Policy</Link></li>
              <li><Link href="/contact">Contact Information</Link></li>
              <li>
                <a href="https://github.com/smile-plzz" target="_blank" rel="noreferrer">
                  GitHub Profile
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <div>
            © {new Date().getFullYear()} Indie App Marketplace. All software source code is open source under MIT or Apache-2.0.
          </div>
          <div>
            Operating with transparent pricing in BDT and USD.
          </div>
        </div>
      </footer>
    </div>
  );
}

import type { Metadata } from "next";
import { PublicLayout } from "@/components/PublicLayout";
import styles from "@/components/store/store.module.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Open Source and Licensing: Indie App Marketplace",
  description: "Our approach to open-source licenses, commercial distribution, and developer trust.",
};

export default function LicensePage() {
  return (
    <PublicLayout>
      <div className={styles.container}>
        <div style={{ maxWidth: "760px", margin: "0 auto" }}>
          <div className={styles.kicker}>Open Source Ethos</div>
          <h1 className={styles.title}>Open-Source & Licensing</h1>
          <p style={{ fontSize: "14px", color: "var(--color-meta)", marginBottom: "32px" }}>
            Transparency regarding open-source rights and selling pre-built binaries.
          </p>

          <div style={{ fontSize: "15px", lineHeight: "1.8", color: "var(--color-text)", display: "flex", flexDirection: "column", gap: "24px" }}>
            <section>
              <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "22px", margin: "0 0 12px" }}>Can Open-Source Software Be Sold?</h2>
              <p>
                Yes. Under the official Open Source Definition by the Open Source Initiative (OSI), open-source licenses explicitly permit commercial distribution. Free Software Foundation (FSF) guidelines also encourage charging a fee for distribution and binary packaging.
              </p>
              <p>
                The Free Software Foundation explains:
                <br />
                <em>"Selling exceptions, physical media, or convenient binaries is a legitimate way to fund free software development."</em>
              </p>
            </section>

            <section>
              <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "22px", margin: "0 0 12px" }}>Our Free Route Guarantee</h2>
              <p>
                We believe that selling open-source software is only ethical if the free route remains completely open, transparent, and easy to find:
              </p>
              <ul style={{ paddingLeft: "24px" }}>
                <li>Every product page features a direct link to the public GitHub repository.</li>
                <li>The complete source code is maintained publicly under recognized OSI-approved licenses (MIT, Apache-2.0, BSD).</li>
                <li>Anyone with developer tooling is free to clone, build, audit, and distribute their own builds without paying us anything.</li>
                <li>The fee on this marketplace is solely for the convenience of verified, code-signed, pre-compiled installers, malware scans, checksum verification, and direct support.</li>
              </ul>
            </section>

            <section>
              <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "22px", margin: "0 0 12px" }}>Catalog Vetting Checklist</h2>
              <p>
                Before any application is listed on this store, it must pass a strict internal vetting review:
              </p>
              <ol style={{ paddingLeft: "24px" }}>
                <li><strong>Explicit License:</strong> The repository contains an unambiguous open-source LICENSE file.</li>
                <li><strong>Dependency Audit:</strong> All third-party libraries and fonts permit commercial redistribution.</li>
                <li><strong>No Unlicensed Content:</strong> We strictly prohibit and refuse to build tools whose primary purpose is scraping, streaming, or downloading copyrighted media from unauthorized sources.</li>
                <li><strong>Security Audit:</strong> Every installer is scanned with automated antimalware analysis before release.</li>
              </ol>
            </section>

            <div style={{ marginTop: "16px" }}>
              <Link href="/store" className={styles.secondaryBtn} style={{ width: "auto", display: "inline-block" }}>
                Explore the App Store
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

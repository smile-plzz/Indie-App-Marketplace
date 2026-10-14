import Link from "next/link";
import type { ReactNode } from "react";
import { getPosts, getSettings } from "@/lib/content";
import { navItems, SOCIALS } from "./nav";
import { MobileDrawer } from "./MobileDrawer";
import { SidebarNav } from "./SidebarNav";
import { ThemeToggle } from "./ThemeToggle";
import { Plate } from "./Plate";
import styles from "./Sidebar.module.css";

export async function PublicLayout({ children }: { children: ReactNode }) {
  const [settings] = await Promise.all([getSettings()]);
  const items = navItems();

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar} aria-label="Site">
        <div className={styles.identity}>
          <Link href="/" aria-label={`${settings.name}: home`}>
            <Plate image={settings.portrait ?? null} height={64} width={64} />
          </Link>
          <div>
            <div className={styles.name}>
              Md. Ismail
              <br />
              Hossain
            </div>
            <div className={styles.meta}>
              {settings.role}
              <br />
              {settings.locationShort}
            </div>
          </div>
        </div>

        <SidebarNav items={items} />

        <div className={styles.foot}>
          <div className={styles.availability}>
            <span className="dot" style={{ background: "var(--color-accent)" }} />
            {settings.availability}
          </div>
          <div className="hr" style={{ margin: "2px 0" }} />
          <div className={styles.socials}>
            {SOCIALS.map((social) => (
              <a
                key={social.key}
                href={settings.links[social.key]}
                target="_blank"
                rel="noreferrer"
                aria-label={social.label}
              >
                {social.short}
              </a>
            ))}
          </div>
          <ThemeToggle />
        </div>
      </aside>

      <div className={styles.main}>
        <header className={styles.topbar}>
          <Link href="/" className={styles.topbarLeft} data-topbar-brand>
            <Plate image={settings.portrait ?? null} height={30} width={30} />
            <span className={styles.topbarName}>{settings.name}</span>
          </Link>
          <MobileDrawer items={items} settings={settings} />
        </header>
        <main>{children}</main>
      </div>
    </div>
  );
}

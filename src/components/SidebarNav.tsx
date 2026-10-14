"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "./nav";
import styles from "./Sidebar.module.css";

export function SidebarNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className={styles.nav} aria-label="Sections">
      {items.map((item) => {
        // "/#contact" is a fragment on home, so only "/" itself marks it.
        const target = item.href.split("#")[0] || "/";
        const active =
          target === "/"
            ? pathname === "/" && !item.href.includes("#")
            : pathname === target || pathname.startsWith(`${target}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className="snav"
            aria-current={active ? "page" : undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

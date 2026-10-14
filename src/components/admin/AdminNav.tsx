"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./admin.module.css";

export type AdminNavItem = { label: string; href: string; count?: number };

export function AdminNav({ items }: { items: AdminNavItem[] }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Studio" style={{ display: "contents" }}>
      {items.map((item) => {
        const active =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className="anav"
            aria-current={active ? "page" : undefined}
          >
            <span style={{ flex: 1 }}>{item.label}</span>
            {typeof item.count === "number" ? (
              <span className="kick tnum">{item.count}</span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

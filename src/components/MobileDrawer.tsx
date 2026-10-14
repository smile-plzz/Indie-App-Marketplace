"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { SOCIALS, type NavItem } from "./nav";
import type { SiteSettings } from "@/lib/types";
import styles from "./Sidebar.module.css";

const FOCUSABLE =
  'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])';

export function MobileDrawer({
  items,
  settings,
}: {
  items: NavItem[];
  settings: SiteSettings;
}) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  // Route changes close the drawer  -  otherwise it covers the page you landed on.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Focus-trapping Tab keeps a sighted keyboard user inside the drawer, but a
  // screen reader's virtual cursor ignores that trap entirely  -  it can still
  // read into the sidebar and page content behind the drawer. `inert` (with
  // aria-hidden as a fallback for browsers without it) removes that
  // background from the accessibility tree for as long as the drawer is open.
  useEffect(() => {
    if (!open) return;

    const hidden = [
      document.querySelector<HTMLElement>('aside[aria-label="Site"]'),
      document.querySelector<HTMLElement>("main"),
      document.querySelector<HTMLElement>("[data-topbar-brand]"),
    ].filter((node): node is HTMLElement => node !== null);

    for (const node of hidden) {
      node.setAttribute("inert", "");
      node.setAttribute("aria-hidden", "true");
    }

    return () => {
      for (const node of hidden) {
        node.removeAttribute("inert");
        node.removeAttribute("aria-hidden");
      }
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const previous = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    panelRef.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }
      if (event.key !== "Tab") return;

      const nodes = panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (!nodes?.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
      (previous ?? triggerRef.current)?.focus();
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="btn btn-ghost btn-icon"
        style={{ minHeight: 44, minWidth: 44 }}
        aria-label="Open menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <MenuIcon />
      </button>

      {open ? (
        <>
          <button
            type="button"
            className={styles.scrim}
            aria-label="Close menu"
            tabIndex={-1}
            onClick={() => setOpen(false)}
          />
          <div
            ref={panelRef}
            className={styles.drawer}
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
          >
            <div className={styles.drawerClose}>
              <button
                type="button"
                className="btn btn-ghost btn-icon"
                style={{ minHeight: 44, minWidth: 44 }}
                aria-label="Close menu"
                onClick={() => setOpen(false)}
              >
                <CloseIcon />
              </button>
            </div>

            <nav className={styles.drawerNav}>
              {items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rowlink"
                  aria-current={pathname === item.href ? "page" : undefined}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className={styles.drawerFoot}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 13,
                  color: "var(--color-neutral-700)",
                }}
              >
                <span
                  className="dot"
                  style={{ background: "var(--color-accent)" }}
                />
                {settings.availability}
              </div>
              <div className={styles.drawerSocials}>
                {SOCIALS.map((social) => (
                  <a
                    key={social.key}
                    href={settings.links[social.key]}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {social.label}
                  </a>
                ))}
              </div>
              <ThemeToggle block />
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}

function MenuIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

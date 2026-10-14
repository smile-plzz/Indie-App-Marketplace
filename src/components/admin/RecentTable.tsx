"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import styles from "./admin.module.css";

export type RecentRow = {
  id: string;
  title: string;
  type: string;
  status: string;
  href: string;
  updated: string | null;
};

const BADGE: Record<string, string> = {
  Published: "tag-outline",
  Draft: "tag-neutral",
  Hidden: "tag-neutral",
};

/** Recently edited as a table  -  the likely action is "resume what I was doing". */
export function RecentTable({ rows }: { rows: RecentRow[] }) {
  const [query, setQuery] = useState("");

  const shown = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = needle
      ? rows.filter((row) => row.title.toLowerCase().includes(needle))
      : rows;
    return filtered.slice(0, 8);
  }, [rows, query]);

  return (
    <>
      <div className={styles.tableHead}>
        <div className="kick">Recently edited</div>
        <input
          className={`input ${styles.searchInput}`}
          placeholder="Search content"
          aria-label="Search content"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      {shown.length ? (
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Type</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Updated</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((row) => (
              <tr key={row.id}>
                <td>
                  <Link href={row.href}>{row.title}</Link>
                </td>
                <td style={{ color: "var(--color-neutral-700)" }}>{row.type}</td>
                <td>
                  <span className={`tag ${BADGE[row.status] ?? "tag-neutral"}`}>
                    {row.status}
                  </span>
                </td>
                <td className="tnum" style={{ textAlign: "right", color: "var(--color-meta)" }}>
                  {formatUpdated(row.updated)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className={styles.emptyRail}>Nothing matches “{query}”.</div>
      )}
    </>
  );
}

function formatUpdated(value: string | null) {
  if (!value) return " - ";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return " - ";

  const hours = (Date.now() - date.getTime()) / 36e5;
  if (hours < 1) return "just now";
  if (hours < 24) return `${Math.round(hours)} h ago`;
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

import Link from "next/link";
import type { ReactNode } from "react";

/**
 * The 404/500 composition from frame 15  -  a tabular Cormorant numeral in
 * neutral-300 beside a 24px headline, one line of explanation, one way back.
 * Shared so the root boundary and the public one cannot drift apart.
 */
export function StatusBlock({
  code,
  title,
  detail,
  action,
}: {
  code: string;
  title: string;
  detail: string;
  action?: ReactNode;
}) {
  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        padding: "64px 20px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 20,
          margin: "0 auto",
          maxWidth: 560,
          flexWrap: "wrap",
        }}
      >
        <span
          className="tnum"
          style={{
            fontFamily: "var(--font-heading)",
            fontWeight: 400,
            fontSize: 56,
            lineHeight: 1,
            color: "var(--color-meta)",
          }}
        >
          {code}
        </span>
        <div>
          <h1
            className="display"
            style={{ fontFamily: "var(--font-heading)", fontSize: 24, margin: 0 }}
          >
            {title}
          </h1>
          <p
            style={{
              fontSize: 14,
              color: "var(--color-neutral-700)",
              margin: "4px 0 8px",
            }}
          >
            {detail}
          </p>
          {action ?? (
            <Link href="/" style={{ fontSize: 13.5 }}>
              Back to the index →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";


import { useState } from "react";

/**
 * The visitor badge is a live third-party image, not content  -  next/image
 * would cache it and freeze the count, so it stays a plain <img>. Ad-blockers
 * and privacy extensions frequently block the request, so a failed load
 * hides the badge entirely rather than showing a broken-image glyph.
 */
export function VisitorCount({ src }: { src: string }) {
  const [broken, setBroken] = useState(false);
  if (broken) return null;

  return (
    <span
      className="tnum"
      style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
    >
      <span>Visitors</span>
      <img
        src={src}
        alt="Visitor count"
        height={16}
        style={{ height: 16, width: "auto", opacity: 0.7 }}
        onError={() => setBroken(true)}
      />
    </span>
  );
}

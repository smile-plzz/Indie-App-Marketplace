"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * 12px translate + fade, once, ~300ms, staggered across siblings.
 * Gated on prefers-reduced-motion  -  the CSS neutralises .reveal there, and
 * this shows content immediately so nothing depends on the observer firing.
 */
export function Reveal({
  children,
  delay = 0,
  as: Tag = "div",
}: {
  children: ReactNode;
  delay?: number;
  as?: "div" | "section" | "article" | "li";
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setShown(true);
      return;
    }

    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as never}
      className="reveal"
      data-shown={shown}
      style={{ transitionDelay: shown ? `${delay}ms` : undefined }}
    >
      {children}
    </Tag>
  );
}

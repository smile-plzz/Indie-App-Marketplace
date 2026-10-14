"use client";

import { useEffect, useState } from "react";

type Props = { className?: string; block?: boolean };

/** Flips the [data-theme] attribute the tokens hang off, and persists it. */
export function ThemeToggle({ className, block }: Props) {
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme");
    setTheme(current === "dark" ? "dark" : "light");
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      // Private mode  -  the choice just does not persist.
    }
    setTheme(next);
  }

  // Until the effect runs the label is unknown; render a stable placeholder so
  // the markup does not shift.
  const label = theme === "dark" ? "Light" : "Dark";

  return (
    <button
      type="button"
      onClick={toggle}
      className={className ?? `btn btn-secondary ${block ? "btn-block" : ""}`}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      style={
        block
          ? { minHeight: 48 }
          : {
              justifyContent: "flex-start",
              paddingLeft: 0,
              paddingRight: 0,
              border: 0,
              fontSize: 12,
            }
      }
    >
      {block ? `${label} mode` : label}
    </button>
  );
}

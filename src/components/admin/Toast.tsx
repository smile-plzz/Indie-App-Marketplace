"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type Variant = "success" | "error" | "neutral";
type Toast = { id: number; text: string; variant: Variant; at: string };

const ToastContext = createContext<(text: string, variant?: Variant) => void>(() => {});

export function useToast() {
  return useContext(ToastContext);
}

/**
 * A 1px bordered strip  -  accent for success, accent-700 for failure, divider
 * for neutral. No fills and no icons, per the state frame.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((text: string, variant: Variant = "neutral") => {
    const id = Date.now() + Math.random();
    const at = new Date().toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
    setToasts((current) => [...current, { id, text, variant, at }]);
    // Errors stay long enough to read and act on; confirmations do not.
    window.setTimeout(
      () => setToasts((current) => current.filter((toast) => toast.id !== id)),
      variant === "error" ? 8000 : 4000,
    );
  }, []);

  const value = useMemo(() => push, [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        style={{
          position: "fixed",
          right: 20,
          bottom: 20,
          zIndex: 90,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          maxWidth: "min(360px, calc(100vw - 40px))",
        }}
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role={toast.variant === "error" ? "alert" : "status"}
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              gap: 14,
              padding: "10px 14px",
              fontSize: 13.5,
              background: "var(--color-bg)",
              border: `1px solid ${
                toast.variant === "success"
                  ? "var(--color-accent)"
                  : toast.variant === "error"
                    ? "var(--color-accent-prose)"
                    : "var(--color-divider)"
              }`,
              color:
                toast.variant === "error"
                  ? "var(--color-accent-prose)"
                  : "var(--color-text)",
            }}
          >
            <span>{toast.text}</span>
            <span className="kick tnum">{toast.at}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

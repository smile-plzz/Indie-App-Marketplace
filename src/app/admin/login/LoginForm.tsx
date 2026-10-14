"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    const password = String(new FormData(event.currentTarget).get("password") ?? "");
    const response = await fetch("/api/admin/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (response.ok) {
      // Only same-origin paths, so a crafted ?next= cannot bounce elsewhere.
      const next = params.get("next");
      router.replace(next?.startsWith("/admin") ? next : "/admin");
      router.refresh();
      return;
    }

    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    setError(body?.error ?? "Sign-in failed.");
    setBusy(false);
  }

  return (
    <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="field" data-invalid={error ? "true" : undefined}>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          className="input"
          autoComplete="current-password"
          autoFocus
          required
        />
        {error ? <div className="field-error">{error}</div> : null}
      </div>
      <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
        {busy ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

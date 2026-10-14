import type { Metadata } from "next";
import { Suspense } from "react";
import { adminConfigured } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Studio", robots: { index: false } };

export default function LoginPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 24,
      }}
    >
      <div style={{ width: "min(360px, 100%)" }}>
        <div className="kick">Studio</div>
        <h1
          className="display"
          style={{ fontSize: 34, fontWeight: 400, margin: "8px 0 20px" }}
        >
          Sign in to edit
        </h1>
        {adminConfigured() ? (
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        ) : (
          <p style={{ fontSize: 14, color: "var(--color-accent-prose)" }}>
            The studio is closed  -  <span className="tnum">ADMIN_PASSWORD</span>{" "}
            and <span className="tnum">ADMIN_SESSION_SECRET</span> are not set on
            this deployment.
          </p>
        )}
      </div>
    </main>
  );
}

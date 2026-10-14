"use client";

import { useRouter } from "next/navigation";

export function SignOut() {
  const router = useRouter();

  return (
    <button
      type="button"
      className="btn btn-ghost"
      style={{ alignSelf: "flex-start", padding: 0, fontSize: 12 }}
      onClick={async () => {
        await fetch("/api/admin/session", { method: "DELETE" });
        router.replace("/admin/login");
        router.refresh();
      }}
    >
      Sign out
    </button>
  );
}

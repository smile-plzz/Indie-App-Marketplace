"use client";

import Link from "next/link";
import { useEffect } from "react";
import { StatusBlock } from "@/components/StatusBlock";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <StatusBlock
      code="500"
      title="Something broke on my side"
      detail="The page failed to render. Trying again usually clears it; if not, the index is intact."
      action={
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <button type="button" className="btn btn-primary" onClick={reset}>
            Try again
          </button>
          <Link href="/" style={{ fontSize: 13.5 }}>
            Back to the index →
          </Link>
        </div>
      }
    />
  );
}

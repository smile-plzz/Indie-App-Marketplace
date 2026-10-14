"use client";

import { useRef, useState } from "react";
import type { ImageRef } from "@/lib/types";
import { useToast } from "./Toast";
import styles from "./admin.module.css";

export type UploadedAsset = { id: string; url: string };

/**
 * Upload-or-replace for a single image. Shares the media route with the
 * library, so there is one upload path in the product.
 */
export function ImageField({
  label,
  image,
  writable,
  onChange,
}: {
  label: string;
  image: ImageRef;
  writable: boolean;
  onChange: (asset: UploadedAsset | null) => void;
}) {
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function upload(file: File) {
    setBusy(true);
    const form = new FormData();
    form.append("file", file);

    const response = await fetch("/api/admin/media", { method: "POST", body: form });
    const body = (await response.json().catch(() => null)) as
      | { id?: string; url?: string; error?: string }
      | null;
    setBusy(false);

    if (!response.ok || !body?.id || !body.url) {
      toast(body?.error ?? "The upload failed.", "error");
      return;
    }
    onChange({ id: body.id, url: body.url });
    toast("Image uploaded", "success");
  }

  return (
    <div className="field">
      <label htmlFor={`${label}-file`}>{label}</label>
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
        {image?.url ? (
          <div className="plate" style={{ width: 128, height: 78, flex: "none" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        ) : (
          <div
            className={styles.emptyRail}
            style={{ width: 128, height: 78, padding: 0, display: "grid", placeItems: "center", fontSize: 12 }}
          >
            None
          </div>
        )}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input
            id={`${label}-file`}
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/avif"
            hidden
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void upload(file);
              event.target.value = "";
            }}
          />
          <button
            type="button"
            className="btn btn-secondary"
            style={{ fontSize: 13 }}
            disabled={busy || !writable}
            onClick={() => inputRef.current?.click()}
          >
            {busy ? "Uploading…" : image?.url ? "Replace" : "Upload"}
          </button>
          {image?.url ? (
            <button
              type="button"
              className="btn btn-ghost"
              style={{ fontSize: 13 }}
              disabled={!writable}
              title={writable ? undefined : "Studio is read-only"}
              onClick={() => onChange(null)}
            >
              Remove
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useMemo, useRef, useState, type DragEvent } from "react";
import type { MediaAsset } from "@/lib/admin-content";
import { Dialog } from "./Dialog";
import { useToast } from "./Toast";
import styles from "./admin.module.css";

export function MediaLibrary({
  assets,
  writable,
}: {
  assets: MediaAsset[];
  writable: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [over, setOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState<MediaAsset | null>(null);
  const [deleting, setDeleting] = useState(false);

  const shown = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return assets;
    return assets.filter(
      (asset) =>
        asset.originalFilename?.toLowerCase().includes(needle) ||
        asset.usedBy.some((title) => title?.toLowerCase().includes(needle)),
    );
  }, [assets, query]);

  async function upload(files: FileList | File[]) {
    setBusy(true);
    let failed = 0;

    for (const file of Array.from(files)) {
      const form = new FormData();
      form.append("file", file);
      const response = await fetch("/api/admin/media", { method: "POST", body: form });
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        toast(body?.error ?? `${file.name} did not upload.`, "error");
        failed += 1;
      }
    }

    setBusy(false);
    const uploaded = Array.from(files).length - failed;
    if (uploaded > 0) {
      toast(`${uploaded} ${uploaded === 1 ? "image" : "images"} uploaded`, "success");
      router.refresh();
    }
  }

  async function confirmDelete() {
    if (!pending) return;
    setDeleting(true);
    const response = await fetch("/api/admin/media", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: pending._id }),
    });
    setDeleting(false);
    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      toast(body?.error ?? "Could not delete the image.", "error");
      return;
    }
    toast("Image deleted", "success");
    setPending(null);
    router.refresh();
  }

  function onDrop(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    setOver(false);
    if (!writable) {
      toast("Studio is read-only  -  connect Sanity to upload.", "error");
      return;
    }
    if (event.dataTransfer.files.length) void upload(event.dataTransfer.files);
  }

  return (
    <>
      <div className={styles.tableHead}>
        <input
          className={`input ${styles.searchInput}`}
          placeholder="Search by name or project"
          aria-label="Search media"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      <div className={styles.mediaGrid}>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/avif"
          multiple
          hidden
          onChange={(event) => {
            if (event.target.files?.length) void upload(event.target.files);
            event.target.value = "";
          }}
        />
        <button
          type="button"
          className={styles.dropTile}
          data-over={over ? "true" : undefined}
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => {
            event.preventDefault();
            setOver(true);
          }}
          onDragLeave={() => setOver(false)}
          onDrop={onDrop}
        >
          <span className={styles.dropPlus} aria-hidden="true">
            +
          </span>
          {busy ? "Uploading…" : "Drop images here"}
          <span style={{ color: "var(--color-meta)" }}>or click to browse</span>
        </button>

        {shown.map((asset) => (
          <figure key={asset._id} style={{ position: "relative" }}>
            <div className="plate" style={{ height: 118 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={asset.url}
                alt={asset.originalFilename ?? ""}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-icon"
              style={{
                position: "absolute",
                top: 6,
                right: 6,
                fontSize: 13,
                background: "var(--color-bg)",
              }}
              aria-label={`Delete ${asset.originalFilename ?? "image"}`}
              disabled={!writable}
              title={writable ? undefined : "Studio is read-only"}
              onClick={() => setPending(asset)}
            >
              ×
            </button>
            <figcaption className={styles.mediaCaption}>
              <span className={styles.mediaName} title={asset.originalFilename ?? undefined}>
                {asset.originalFilename ?? "untitled"}
              </span>
              <span className="tnum">{formatSize(asset.size)}</span>
            </figcaption>
            {asset.usedBy.filter(Boolean).length ? (
              <div className="kick" style={{ marginTop: 4 }}>
                {asset.usedBy.filter(Boolean).join(", ")}
              </div>
            ) : null}
          </figure>
        ))}
      </div>

      {!assets.length ? (
        <p style={{ fontSize: 13.5, color: "var(--color-meta)", marginTop: 20 }}>
          {writable
            ? "Nothing uploaded yet. Nine or more projects are waiting on a screenshot."
            : "Media lives in Sanity  -  connect a project to upload."}
        </p>
      ) : null}

      <Dialog
        open={pending !== null}
        title="Delete this image?"
        onClose={() => setPending(null)}
        actions={
          <>
            <button type="button" className="btn btn-ghost" onClick={() => setPending(null)}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => void confirmDelete()}
              disabled={deleting}
            >
              {deleting ? "Deleting…" : "Delete"}
            </button>
          </>
        }
      >
        “{pending?.originalFilename ?? "This image"}” will be removed permanently.
        {pending?.usedBy.filter(Boolean).length
          ? ` It is currently used by ${pending.usedBy.filter(Boolean).join(", ")}  -  that project will lose its screenshot.`
          : ""}
      </Dialog>
    </>
  );
}

function formatSize(bytes: number) {
  if (!bytes) return " - ";
  const kb = bytes / 1024;
  return kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${Math.round(kb)} KB`;
}

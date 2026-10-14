"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AdminPost } from "@/lib/admin-content";
import { Dialog } from "./Dialog";
import { useToast } from "./Toast";
import styles from "./admin.module.css";

export function PostList({
  posts,
  writable,
}: {
  posts: AdminPost[];
  writable: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState<AdminPost | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function create() {
    setBusy(true);
    const response = await fetch("/api/admin/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Untitled", kind: "Note", summary: "" }),
    });
    const body = (await response.json().catch(() => null)) as
      | { id?: string; error?: string }
      | null;
    setBusy(false);

    if (!response.ok || !body?.id) {
      toast(body?.error ?? "Could not create the post.", "error");
      return;
    }
    router.push(`/admin/writing/${encodeURIComponent(body.id)}`);
  }

  async function confirmDelete() {
    if (!pending) return;
    setDeleting(true);
    const response = await fetch(
      `/api/admin/posts/${encodeURIComponent(pending._id)}`,
      { method: "DELETE" },
    );
    setDeleting(false);
    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      toast(body?.error ?? "Could not delete the post.", "error");
      return;
    }
    toast("Post deleted", "success");
    setPending(null);
    router.refresh();
  }

  return (
    <>
      <div className={styles.tableHead}>
        <div className="kick">All posts</div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={create}
          disabled={busy || !writable}
          title={writable ? undefined : "Studio is read-only"}
        >
          New post
        </button>
      </div>

      {posts.length ? (
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Kind</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Date</th>
              <th style={{ width: 40 }} aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post._id}>
                <td>
                  <Link href={`/admin/writing/${encodeURIComponent(post._id)}`}>
                    {post.title || "Untitled"}
                  </Link>
                </td>
                <td style={{ color: "var(--color-neutral-700)" }}>{post.kind}</td>
                <td>
                  <span className={`tag ${post._draft ? "tag-neutral" : "tag-outline"}`}>
                    {post._draft ? "Draft" : "Published"}
                  </span>
                </td>
                <td className="tnum" style={{ textAlign: "right", color: "var(--color-meta)" }}>
                  {post.date}
                </td>
                <td style={{ textAlign: "right" }}>
                  <button
                    type="button"
                    className="btn btn-ghost btn-icon"
                    style={{ fontSize: 13 }}
                    aria-label={`Delete ${post.title || "post"}`}
                    disabled={!writable}
                    title={writable ? undefined : "Studio is read-only"}
                    onClick={() => setPending(post)}
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className={styles.emptyRail}>
          No posts yet. The public nav link stays hidden until the first one
          publishes.
        </div>
      )}

      <Dialog
        open={pending !== null}
        title="Delete this post?"
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
        “{pending?.title || "Untitled"}” will be removed permanently. This cannot
        be undone.
      </Dialog>
    </>
  );
}

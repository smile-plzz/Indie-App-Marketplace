"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { AdminProject } from "@/lib/admin-content";
import { Dialog } from "./Dialog";
import { useToast } from "./Toast";
import styles from "./admin.module.css";

export function ProjectList({
  projects,
  writable,
}: {
  projects: AdminProject[];
  writable: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState<AdminProject | null>(null);
  const [deleting, setDeleting] = useState(false);

  const shown = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return projects;
    return projects.filter(
      (project) =>
        project.title.toLowerCase().includes(needle) ||
        project.tags.some((tag) => tag.toLowerCase().includes(needle)),
    );
  }, [projects, query]);

  async function create() {
    setBusy(true);
    const response = await fetch("/api/admin/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Untitled project", summary: "" }),
    });
    const body = (await response.json().catch(() => null)) as
      | { id?: string; error?: string }
      | null;
    setBusy(false);

    if (!response.ok || !body?.id) {
      toast(body?.error ?? "Could not create the project.", "error");
      return;
    }
    router.push(`/admin/projects/${encodeURIComponent(body.id)}`);
  }

  async function confirmDelete() {
    if (!pending) return;
    setDeleting(true);
    const response = await fetch(
      `/api/admin/projects/${encodeURIComponent(pending._id)}`,
      { method: "DELETE" },
    );
    setDeleting(false);
    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      toast(body?.error ?? "Could not delete the project.", "error");
      return;
    }
    toast("Project deleted", "success");
    setPending(null);
    router.refresh();
  }

  return (
    <>
      <div className={styles.tableHead}>
        <input
          className={`input ${styles.searchInput}`}
          placeholder="Search projects"
          aria-label="Search projects"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <button
          type="button"
          className="btn btn-primary"
          onClick={create}
          disabled={busy || !writable}
          aria-disabled={!writable}
          title={writable ? undefined : "Studio is read-only"}
        >
          New project
        </button>
      </div>

      {shown.length ? (
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: 48 }}>#</th>
              <th>Title</th>
              <th>Category</th>
              <th>Shot</th>
              <th>Write-up</th>
              <th style={{ textAlign: "right" }}>State</th>
              <th style={{ width: 40 }} aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {shown.map((project) => (
              <tr key={project._id}>
                <td className="tnum" style={{ color: "var(--color-meta)" }}>
                  {String(project.order).padStart(2, "0")}
                </td>
                <td>
                  <Link href={`/admin/projects/${encodeURIComponent(project._id)}`}>
                    {project.title}
                  </Link>
                </td>
                <td style={{ color: "var(--color-neutral-700)" }}>{project.category}</td>
                <td>
                  <span className={`tag ${project.shot?.url ? "tag-outline" : "tag-neutral"}`}>
                    {project.shot?.url ? "Yes" : "Missing"}
                  </span>
                </td>
                <td>
                  <span className={`tag ${project.placeholderCopy ? "tag-neutral" : "tag-outline"}`}>
                    {project.placeholderCopy ? "Placeholder" : "Written"}
                  </span>
                </td>
                <td style={{ textAlign: "right" }}>
                  <span className="kick">
                    {project.hidden ? "Hidden" : project.featured ? "Featured" : "Live"}
                  </span>
                </td>
                <td style={{ textAlign: "right" }}>
                  <button
                    type="button"
                    className="btn btn-ghost btn-icon"
                    style={{ fontSize: 13 }}
                    aria-label={`Delete ${project.title || "project"}`}
                    disabled={!writable}
                    title={writable ? undefined : "Studio is read-only"}
                    onClick={() => setPending(project)}
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className={styles.emptyRail}>Nothing matches “{query}”.</div>
      )}

      <Dialog
        open={pending !== null}
        title="Delete this project?"
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
        “{pending?.title || "Untitled project"}” will be removed permanently. This
        cannot be undone.
      </Dialog>
    </>
  );
}

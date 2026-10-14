"use client";

import Link from "next/link";
import { useRef } from "react";
import type { AdminPost } from "@/lib/admin-content";
import { markdownToBlocks, readingStats } from "@/lib/portable-text";
import { Dialog } from "./Dialog";
import { TagInput } from "./TagInput";
import { useDraft } from "./useDraft";
import styles from "./admin.module.css";

/**
 * The toolbar writes the closed Markdown subset the reading page can style  - 
 * nothing here can produce output the public type system has no rule for.
 */
const TOOLS = [
  { label: "I", title: "Italic", wrap: ["*", "*"] },
  { label: "H2", title: "Heading", prefix: "## " },
  { label: "H3", title: "Sub-heading", prefix: "### " },
  { label: "Quote", title: "Blockquote", prefix: "> " },
  { label: "Link", title: "Link", wrap: ["[", "](https://)"] },
] as const;

export function PostEditor({
  post,
  source,
  writable,
}: {
  post: AdminPost;
  source: string;
  writable: boolean;
}) {
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const isDraft = post._id.startsWith("drafts.");

  const { draft, set, dirty, busy, savedAt, commit, guard } = useDraft({
    writable,
    initial: {
      title: post.title ?? "",
      slug: post.slug ?? "",
      date: post.date ?? new Date().toISOString().slice(0, 10),
      kind: (post.kind ?? "Note") as "Essay" | "Note",
      summary: post.summary ?? "",
      tags: post.tags ?? [],
      source,
    },
    save: async (next, { silent }) => {
      const stats = readingStats(next.source);
      const response = await fetch(
        `/api/admin/posts/${encodeURIComponent(post._id)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: next.title,
            slug: next.slug || next.title,
            date: next.date,
            kind: next.kind,
            summary: next.summary,
            tags: next.tags,
            readingMinutes: stats.minutes,
            body: markdownToBlocks(next.source),
            // An autosave leaves a draft a draft; only Publish promotes it.
            publish: !silent,
          }),
        },
      );
      const body = (await response.json().catch(() => null)) as
        | { id?: string; error?: string }
        | null;
      if (!response.ok) throw new Error(body?.error ?? "The save did not go through.");
      // Publishing drops the drafts. prefix, so the editor follows the document.
      if (body?.id && body.id !== post._id) {
        return `/admin/writing/${encodeURIComponent(body.id)}`;
      }
    },
  });

  const stats = readingStats(draft.source);

  function apply(tool: (typeof TOOLS)[number]) {
    const node = bodyRef.current;
    if (!node) return;

    const { selectionStart: start, selectionEnd: end, value } = node;
    let next = value;
    let caret = end;

    if ("wrap" in tool && tool.wrap) {
      const [open, close] = tool.wrap;
      next = value.slice(0, start) + open + value.slice(start, end) + close + value.slice(end);
      caret = end + open.length + close.length;
    } else if ("prefix" in tool && tool.prefix) {
      const lineStart = value.lastIndexOf("\n", start - 1) + 1;
      next = value.slice(0, lineStart) + tool.prefix + value.slice(lineStart);
      caret = end + tool.prefix.length;
    }

    set("source", next);
    requestAnimationFrame(() => {
      node.focus();
      node.setSelectionRange(caret, caret);
    });
  }

  return (
    <>
      <div className={styles.editorBar}>
        <div className={styles.editorBarLeft}>
          <Link href="/admin/writing" style={{ fontSize: 13 }}>
            ← Writing
          </Link>
          <span className={`tag ${isDraft ? "tag-neutral" : "tag-outline"}`}>
            {isDraft ? "Draft" : "Published"}
          </span>
          {dirty ? <span className="tag tag-accent">Unsaved changes</span> : null}
        </div>
        <div className={styles.actions}>
          {savedAt ? <span className="kick tnum">Autosaved {savedAt}</span> : null}
          {!isDraft && draft.slug ? (
            <Link className="btn btn-secondary" href={`/writing/${draft.slug}`} target="_blank">
              Preview
            </Link>
          ) : null}
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => void commit()}
            disabled={busy || !dirty || !writable}
          >
            {busy ? "Publishing…" : "Publish"}
          </button>
        </div>
      </div>

      <div className={styles.postSplit}>
        <div>
          <label htmlFor="post-title" className="kick">
            Title
          </label>
          <input
            id="post-title"
            className={`input ${styles.postTitleInput}`}
            value={draft.title}
            onChange={(event) => set("title", event.target.value)}
          />

          <div className={styles.toolbar} role="toolbar" aria-label="Formatting">
            {TOOLS.map((tool) => (
              <button
                key={tool.label}
                type="button"
                className="tag tag-outline"
                title={tool.title}
                onClick={() => apply(tool)}
              >
                {tool.label === "I" ? <em>I</em> : tool.label}
              </button>
            ))}
          </div>

          <label htmlFor="post-body" className="kick">
            Body
          </label>
          <textarea
            id="post-body"
            ref={bodyRef}
            className={`input ${styles.bodyInput}`}
            value={draft.source}
            onChange={(event) => set("source", event.target.value)}
            placeholder={"A blank line starts a new paragraph.\n\n## A heading\n\n> A pull quote"}
          />
        </div>

        <aside className={styles.sideCard}>
          <div className="kick">Post settings</div>

          <div className="field">
            <label htmlFor="post-slug">Slug</label>
            <input
              id="post-slug"
              className="input"
              value={draft.slug}
              onChange={(event) => set("slug", event.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="post-date">Date</label>
            <input
              id="post-date"
              type="date"
              className="input tnum"
              value={draft.date}
              onChange={(event) => set("date", event.target.value)}
            />
          </div>

          <div className="field">
            <span className="field-legend" id="kind-label" style={{ display: "block", fontSize: 12, marginBottom: 5, color: "var(--color-neutral-700)" }}>
              Kind
            </span>
            <div className="seg" role="group" aria-labelledby="kind-label">
              {(["Essay", "Note"] as const).map((kind) => (
                <button
                  key={kind}
                  type="button"
                  className="seg-opt"
                  aria-pressed={draft.kind === kind}
                  onClick={() => set("kind", kind)}
                >
                  {kind}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <label htmlFor="post-summary">Summary</label>
            <textarea
              id="post-summary"
              className="input"
              rows={3}
              value={draft.summary}
              onChange={(event) => set("summary", event.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="post-tags">Tags</label>
            <TagInput
              id="post-tags"
              value={draft.tags}
              onChange={(next) => set("tags", next)}
              writable={writable}
            />
          </div>

          <div style={{ fontSize: 12, color: "var(--color-meta)" }}>
            Reading time <span className="tnum">{stats.minutes} min</span> ·{" "}
            <span className="tnum">{stats.words.toLocaleString("en-GB")}</span> words
          </div>
        </aside>
      </div>

      <Dialog
        open={guard.open}
        title="Leave without publishing?"
        onClose={guard.stay}
        actions={
          <>
            <button type="button" className="btn btn-ghost" onClick={guard.stay}>
              Stay
            </button>
            <button type="button" className="btn btn-secondary" onClick={guard.leave}>
              Leave
            </button>
            <button type="button" className="btn btn-primary" onClick={guard.publishAndLeave}>
              Publish and leave
            </button>
          </>
        }
      >
        {draft.title || "This post"} has unsaved edits. They stay as a draft, but
        the live page will not change.
      </Dialog>
    </>
  );
}

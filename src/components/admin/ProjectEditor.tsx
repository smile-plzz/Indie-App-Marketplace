"use client";

import Link from "next/link";
import { useState } from "react";
import { ProjectDetailView } from "@/components/ProjectDetail";
import type { AdminProject } from "@/lib/admin-content";
import type { Project } from "@/lib/types";
import { Dialog } from "./Dialog";
import { ImageField } from "./ImageField";
import { TagInput } from "./TagInput";
import { useDraft } from "./useDraft";
import styles from "./admin.module.css";

const CATEGORIES = ["AI & Agents", "Data Viz", "Full-Stack", "Health Tech", "Streaming"];

export function ProjectEditor({
  project,
  writable,
}: {
  project: AdminProject;
  writable: boolean;
}) {
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");

  const { draft, set, dirty, busy, savedAt, commit, guard } = useDraft({
    writable,
    // Projects have no draft document (a hidden project is still the live
    // document), so a silent autosave would publish half-finished edits.
    autosave: false,
    initial: {
      title: project.title ?? "",
      slug: project.slug ?? "",
      year: project.year ?? "",
      order: project.order ?? 0,
      summary: project.summary ?? "",
      category: project.category ?? CATEGORIES[0],
      tags: project.tags ?? [],
      liveUrl: project.liveUrl ?? "",
      repoUrl: project.repoUrl ?? "",
      role: project.role ?? "",
      stack: project.stack ?? "",
      problem: project.problem ?? "",
      approach: project.approach ?? "",
      outcome: project.outcome ?? "",
      imageHeight: project.imageHeight ?? 200,
      placeholderCopy: project.placeholderCopy ?? false,
      featured: project.featured ?? false,
      hidden: project.hidden ?? false,
      shot: project.shot ?? null,
      shotAssetId: (project.shot as { assetId?: string } | null)?.assetId ?? null,
    },
    save: async (next) => {
      const response = await fetch(
        `/api/admin/projects/${encodeURIComponent(project._id)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...next,
            liveUrl: next.liveUrl || null,
            repoUrl: next.repoUrl || null,
            shot: next.shotAssetId
              ? {
                  _type: "image",
                  asset: { _type: "reference", _ref: next.shotAssetId },
                  alt: next.shot?.alt ?? next.title,
                }
              : null,
          }),
        },
      );
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? "The save did not go through.");
      }
    },
  });

  // The preview renders the public component, so it needs the public shape.
  const previewProject: Project = {
    order: Number(draft.order) || 0,
    slug: draft.slug,
    title: draft.title || "Untitled project",
    year: draft.year,
    summary: draft.summary,
    category: draft.category,
    tags: draft.tags,
    liveUrl: draft.liveUrl || null,
    repoUrl: draft.repoUrl || null,
    role: draft.role || null,
    stack: draft.stack || null,
    featured: draft.featured,
    imageHeight: Number(draft.imageHeight) || 200,
    placeholderCopy: draft.placeholderCopy,
    problem: draft.problem || null,
    approach: draft.approach || null,
    outcome: draft.outcome || null,
    shot: draft.shot,
  };

  return (
    <>
      <div className={styles.editorBar}>
        <div className={styles.editorBarLeft}>
          <Link href="/admin/projects" style={{ fontSize: 13 }}>
            ← Projects
          </Link>
          <span className={styles.editorDocTitle}>{draft.title || "Untitled"}</span>
          {dirty ? <span className="tag tag-accent">Unsaved changes</span> : null}
        </div>
        <div className={styles.actions}>
          {savedAt ? <span className="kick tnum">Published {savedAt}</span> : null}
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

      <div className={styles.editorSplit}>
        <form className={styles.form} onSubmit={(event) => event.preventDefault()}>
          <Text id="title" label="Title" value={draft.title} onChange={(v) => set("title", v)} />

          <div className={styles.formRow3}>
            <Text id="slug" label="Slug" value={draft.slug} onChange={(v) => set("slug", v)} />
            <Text id="year" label="Year" value={draft.year} onChange={(v) => set("year", v)} tnum />
            <Text
              id="order"
              label="Order"
              value={String(draft.order)}
              onChange={(v) => set("order", Number(v) || 0)}
              tnum
            />
          </div>

          <Text
            id="summary"
            label="One-line summary"
            value={draft.summary}
            onChange={(v) => set("summary", v)}
            rows={2}
          />

          <div className={styles.formRow}>
            <div className="field">
              <label htmlFor="category">Category  -  the filter chip on /projects</label>
              <select
                id="category"
                className="input"
                value={draft.category}
                onChange={(event) => set("category", event.target.value)}
              >
                {CATEGORIES.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </div>
            <Text
              id="imageHeight"
              label="Masonry height (160-260px)"
              value={String(draft.imageHeight)}
              onChange={(v) => set("imageHeight", Number(v) || 200)}
              tnum
            />
          </div>

          <div className={styles.formRow}>
            <Text id="liveUrl" label="Live URL" value={draft.liveUrl} onChange={(v) => set("liveUrl", v)} />
            <Text id="repoUrl" label="Repository" value={draft.repoUrl} onChange={(v) => set("repoUrl", v)} />
          </div>

          <div className={styles.formRow}>
            <Text id="role" label="Role" value={draft.role} onChange={(v) => set("role", v)} />
            <Text id="stack" label="Stack" value={draft.stack} onChange={(v) => set("stack", v)} />
          </div>

          <div className="field">
            <label htmlFor="tags">Tags</label>
            <TagInput
              id="tags"
              value={draft.tags}
              onChange={(next) => set("tags", next)}
              writable={writable}
            />
          </div>

          <ImageField
            label="Screenshot"
            image={draft.shot ?? null}
            writable={writable}
            onChange={(asset) => {
              set("shotAssetId", asset?.id ?? null);
              set("shot", asset ? { url: asset.url, alt: draft.title } : null);
            }}
          />

          <Text id="problem" label="Problem" value={draft.problem} onChange={(v) => set("problem", v)} rows={3} />
          <Text id="approach" label="Approach" value={draft.approach} onChange={(v) => set("approach", v)} rows={3} />
          <Text id="outcome" label="Outcome" value={draft.outcome} onChange={(v) => set("outcome", v)} rows={2} />

          <div className={styles.checkRow}>
            <Check
              label="Featured on home"
              checked={draft.featured}
              onChange={(v) => set("featured", v)}
            />
            <Check
              label="Hide from index"
              checked={draft.hidden}
              onChange={(v) => set("hidden", v)}
            />
            <Check
              label="Write-up is still placeholder"
              checked={draft.placeholderCopy}
              onChange={(v) => set("placeholderCopy", v)}
            />
          </div>
        </form>

        <div className={styles.preview}>
          <div className={styles.previewHead}>
            <div className="kick">Live preview</div>
            <div className="seg">
              <button
                type="button"
                className="seg-opt"
                aria-pressed={device === "desktop"}
                onClick={() => setDevice("desktop")}
              >
                Desktop
              </button>
              <button
                type="button"
                className="seg-opt"
                aria-pressed={device === "mobile"}
                onClick={() => setDevice("mobile")}
              >
                Mobile
              </button>
            </div>
          </div>
          <div
            className={`${styles.previewCanvas} ${device === "mobile" ? styles.previewCanvasMobile : ""}`}
          >
            <ProjectDetailView project={previewProject} dense />
          </div>
        </div>
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
        {draft.title || "This project"} has unsaved edits. They stay as a draft,
        but the live page will not change.
      </Dialog>
    </>
  );
}

function Text({
  id,
  label,
  value,
  onChange,
  rows,
  tnum,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  tnum?: boolean;
}) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {rows ? (
        <textarea
          id={id}
          className="input"
          rows={rows}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <input
          id={id}
          className={`input ${tnum ? "tnum" : ""}`}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </div>
  );
}

function Check({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className={styles.check}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      {label}
    </label>
  );
}

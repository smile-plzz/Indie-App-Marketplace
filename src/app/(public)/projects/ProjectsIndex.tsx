"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { ProjectCard } from "@/components/ProjectCard";
import type { Project } from "@/lib/types";
import styles from "./projects.module.css";

/**
 * Filter state lives in the URL so a filtered view is shareable and the back
 * button behaves. Single-select, as designed.
 */
export function ProjectsIndex({ projects }: { projects: Project[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const active = params.get("tag");

  // Five curated categories, not the raw tag list  -  the chips are an editorial
  // grouping, and eighteen of them would be a wall rather than a filter.
  const categories = useMemo(
    () => [...new Set(projects.map((p) => p.category))].sort(),
    [projects],
  );

  const shown = active
    ? projects.filter((p) => p.category === active)
    : projects;

  function select(tag: string | null) {
    router.replace(
      tag ? `/projects?tag=${encodeURIComponent(tag)}` : "/projects",
      { scroll: false },
    );
  }

  return (
    <>
      <div className={styles.head}>
        <div className="kick">Projects</div>
        <h1 className={`display ${styles.title}`}>
          {projects.length} things I have shipped and kept online.
        </h1>
        <div
          className={`${styles.filters} noscrollbar`}
          role="group"
          aria-label="Filter projects by tag"
        >
          <button
            type="button"
            className={`tag ${active ? "tag-outline" : "tag-accent"}`}
            aria-pressed={!active}
            onClick={() => select(null)}
          >
            All {projects.length}
          </button>
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className={`tag ${active === category ? "tag-accent" : "tag-outline"}`}
              aria-pressed={active === category}
              onClick={() => select(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {shown.length ? (
        <div className={styles.masonry}>
          {shown.map((project) => (
            <div key={project.slug} className={styles.item}>
              <ProjectCard project={project} variant="index" />
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.empty}>
          <div className="display" style={{ fontFamily: "var(--font-heading)", fontSize: 26 }}>
            Nothing filed under {active} yet
          </div>
          <p
            style={{
              fontSize: 14.5,
              color: "var(--color-neutral-700)",
              maxWidth: "38ch",
              margin: 0,
            }}
          >
            Clear the filter to see all {projects.length}.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            style={{ marginTop: 6 }}
            onClick={() => select(null)}
          >
            Clear filter
          </button>
        </div>
      )}
    </>
  );
}

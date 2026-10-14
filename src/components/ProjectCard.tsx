import Link from "next/link";
import { Plate } from "./Plate";
import type { Project } from "@/lib/types";
import styles from "./ProjectCard.module.css";

type Variant = "featured" | "grid" | "index" | "mobile";

const TITLE_SIZE: Record<Variant, number> = {
  featured: 30,
  grid: 23,
  index: 21,
  mobile: 19,
};

const BODY_SIZE: Record<Variant, number> = {
  featured: 15,
  grid: 14,
  index: 13.5,
  mobile: 13.5,
};

/**
 * Prominence comes from size and image, never from colour or fill  -  the
 * featured card is simply bigger with the biggest screenshot.
 */
export function ProjectCard({
  project,
  variant = "grid",
  imageHeight,
  showIndex = true,
  showYear = false,
  tagLimit,
}: {
  project: Project;
  variant?: Variant;
  imageHeight?: number;
  showIndex?: boolean;
  showYear?: boolean;
  tagLimit?: number;
}) {
  const height = imageHeight ?? project.imageHeight;
  const tags = tagLimit ? project.tags.slice(0, tagLimit) : project.tags;
  const number = String(project.order).padStart(2, "0");

  const plate = (
    <Plate
      image={project.shot ?? null}
      height={height}
      fallbackNumber={number}
      fallbackTags={project.tags}
      sizes={
        variant === "featured"
          ? "(max-width: 1023px) 100vw, 560px"
          : "(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 340px"
      }
    />
  );

  const body = (
    <div className={variant === "featured" ? styles.featuredBody : styles.body}>
      {showIndex ? (
        <div className="kick tnum">
          {number}
          {showYear && project.year ? `  -  ${project.year}` : ""}
        </div>
      ) : null}
      {/* The card title is the first heading under the page h1 on both home
          and the index, so it sets at h2 regardless of its type size. */}
      <h2
        className="display"
        style={{
          fontSize: TITLE_SIZE[variant],
          margin: variant === "featured" ? "12px 0 10px" : "8px 0 7px",
        }}
      >
        {project.title}
      </h2>
      <p
        style={{
          fontSize: BODY_SIZE[variant],
          lineHeight: 1.6,
          color: "var(--color-neutral-800)",
          margin: 0,
        }}
      >
        {project.summary}
      </p>
      {tags.length ? (
        <div className={styles.tags}>
          {tags.map((tag, i) => (
            <span
              key={tag}
              className={`tag ${i === 0 ? "tag-accent" : "tag-neutral"}`}
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );

  return (
    <Link
      href={`/projects/${project.slug}`}
      className={`pcard ${variant === "featured" ? styles.featured : ""}`}
    >
      {plate}
      {body}
    </Link>
  );
}

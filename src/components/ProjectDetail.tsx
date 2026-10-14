import { Plate } from "./Plate";
import type { Project } from "@/lib/types";
import styles from "./ProjectDetail.module.css";

/**
 * The project detail body  -  header, hero plate, problem → approach → outcome.
 *
 * Shared between the public route and the studio's preview pane, so the pane
 * renders the real component against draft data rather than a lookalike. That
 * is the whole point of the split view: the design cannot drift.
 */
export function ProjectDetailView({
  project,
  dense = false,
  priority = false,
}: {
  project: Project;
  dense?: boolean;
  priority?: boolean;
}) {
  return (
    <div className={dense ? styles.dense : undefined}>
      <header className={styles.header}>
        <div>
          {project.tags.length ? (
            <div className="kick">{project.tags.join(" · ")}</div>
          ) : null}
          <h1 className={`display ${styles.title}`}>{project.title}</h1>
          <p className={styles.summary}>{project.summary}</p>
        </div>
        <div className={styles.facts}>
          {project.role ? (
            <div className={styles.factRow}>
              <span>Role</span>
              <span className={styles.factValue}>{project.role}</span>
            </div>
          ) : null}
          {project.year ? (
            <div className={styles.factRow}>
              <span>Year</span>
              <span className={`${styles.factValue} tnum`}>{project.year}</span>
            </div>
          ) : null}
          {project.stack ? (
            <div className={styles.factRow}>
              <span>Stack</span>
              <span className={styles.factValue}>{project.stack}</span>
            </div>
          ) : null}
          {project.liveUrl || project.repoUrl ? (
            <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
              {project.liveUrl ? (
                <a
                  className="btn btn-primary"
                  style={{ fontSize: 13 }}
                  href={project.liveUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Live site
                </a>
              ) : null}
              {project.repoUrl ? (
                <a
                  className="btn btn-secondary"
                  style={{ fontSize: 13 }}
                  href={project.repoUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Repository
                </a>
              ) : null}
            </div>
          ) : null}
        </div>
      </header>

      <div className={styles.hero}>
        <Plate
          image={project.shot ?? null}
          height={dense ? 200 : 520}
          priority={priority}
          sizes={dense ? "420px" : "(max-width: 1023px) 100vw, 936px"}
          fallbackNumber={project.order ? String(project.order).padStart(2, "0") : undefined}
          fallbackTags={project.tags}
        />
      </div>

      <div className={styles.writeup}>
        <div className={`kick ${styles.writeupRail}`}>Write-up</div>
        <div className={styles.writeupBody}>
          <Part label="Problem" text={project.problem} />
          <Part label="Approach" text={project.approach} />
          <Part label="Outcome" text={project.outcome} last />
        </div>
      </div>
    </div>
  );
}

function Part({
  label,
  text,
  last,
}: {
  label: string;
  text: string | null;
  last?: boolean;
}) {
  return (
    <>
      <h2 className={styles.sectionLabel}>{label}</h2>
      {text ? (
        <p className="lead" style={last ? { marginBottom: 0 } : undefined}>
          {text}
        </p>
      ) : (
        <p
          className="lead"
          style={{
            color: "var(--color-meta)",
            fontStyle: "italic",
            marginBottom: last ? 0 : undefined,
          }}
        >
          Not written yet.
        </p>
      )}
      {last ? null : <div className="hr" />}
    </>
  );
}

import styles from "./projects.module.css";

/** Hairline-bordered blocks at neutral-200. No shimmer, by design. */
const HEIGHTS = [230, 170, 200, 260, 160, 210, 250, 180, 230];

export function ProjectsSkeleton() {
  return (
    <div className={styles.masonry} aria-hidden="true">
      {HEIGHTS.map((height, i) => (
        <div
          key={i}
          className={styles.item}
          style={{ border: "1px solid var(--color-divider)", opacity: 0.7 }}
        >
          <div style={{ height, background: "var(--color-neutral-200)" }} />
          <div
            style={{
              padding: "16px 18px 18px",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <Bar width="34%" height={9} />
            <Bar width="70%" height={17} />
            <Bar width="100%" height={9} />
            <Bar width="86%" height={9} />
          </div>
        </div>
      ))}
    </div>
  );
}

function Bar({ width, height }: { width: string; height: number }) {
  return (
    <div style={{ width, height, background: "var(--color-neutral-200)" }} />
  );
}

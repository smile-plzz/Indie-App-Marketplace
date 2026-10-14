import type { ReactNode } from "react";
import styles from "./Section.module.css";

type Props = {
  /** The 12px uppercase label that sits in the left rail. */
  kicker?: string;
  /** Extra content under the kicker in the rail  -  role, period, a count. */
  railExtra?: ReactNode;
  /** Right-hand link on the section's header row, e.g. "All 14 projects →". */
  action?: ReactNode;
  children: ReactNode;
  /** "rail" is the 150px 1fr spine; "full" spans the content column. */
  variant?: "rail" | "full";
  last?: boolean;
  id?: string;
};

/**
 * The page's spine. On desktop the kicker sits in a 150px left rail so content
 * starts at the same x-position on every section and scanning stays vertical.
 * Below 1024px it stacks with the kicker above.
 */
export function Section({
  kicker,
  railExtra,
  action,
  children,
  variant = "rail",
  last = false,
  id,
}: Props) {
  if (variant === "full") {
    return (
      <section
        id={id}
        className={`${styles.section} ${last ? styles.last : ""}`}
      >
        {kicker || action ? (
          <div className={styles.fullHeader}>
            {kicker ? <div className="kick">{kicker}</div> : <span />}
            {action}
          </div>
        ) : null}
        {children}
      </section>
    );
  }

  return (
    <section
      id={id}
      className={`${styles.section} ${styles.rail} ${last ? styles.last : ""}`}
    >
      <div className={styles.railLabel}>
        {kicker ? <div className="kick">{kicker}</div> : null}
        {railExtra}
      </div>
      <div className={styles.railBody}>{children}</div>
    </section>
  );
}

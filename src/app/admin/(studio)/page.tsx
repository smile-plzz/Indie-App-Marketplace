import Link from "next/link";
import { adminOverview } from "@/lib/admin-content";
import { studioWritable } from "@/lib/admin";
import { isPlaceholderPositioning } from "@/lib/text";
import styles from "@/components/admin/admin.module.css";
import { RecentTable } from "@/components/admin/RecentTable";

function greeting(hour = new Date().getHours()) {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

/**
 * Not a metrics display  -  a to-do surface. Four counts, what was last touched,
 * and the three things that actually need doing.
 */
export default async function DashboardPage() {
  const { projects, posts, settings, metrics } = await adminOverview();

  const rows = [
    ...projects.map((project) => ({
      id: project._id,
      title: project.title,
      type: "Project",
      status: project.hidden ? "Hidden" : "Published",
      href: `/admin/projects/${encodeURIComponent(project._id)}`,
      updated: project._updatedAt ?? null,
    })),
    ...posts.map((post) => ({
      id: post._id,
      title: post.title,
      type: "Post",
      status: post._draft ? "Draft" : "Published",
      href: `/admin/writing/${encodeURIComponent(post._id)}`,
      updated: post._updatedAt ?? post.date,
    })),
  ].sort((a, b) => (b.updated ?? "").localeCompare(a.updated ?? ""));

  const attention = [
    metrics.missingShots
      ? {
          text: `${metrics.missingShots} projects have no screenshot`,
          label: "Open media →",
          href: "/admin/media",
        }
      : null,
    metrics.placeholderWriteups
      ? {
          text: `${metrics.placeholderWriteups} write-ups are still placeholder copy`,
          label: "Open projects →",
          href: "/admin/projects",
        }
      : null,
    isPlaceholderPositioning(settings.positioning)
      ? {
          text: "Positioning line still placeholder",
          label: "Edit settings →",
          href: "/admin/settings",
        }
      : null,
  ].filter(Boolean) as { text: string; label: string; href: string }[];

  return (
    <>
      <div className={styles.pageHead}>
        <div>
          <div className="kick">Overview</div>
          <h1 className={styles.pageTitle}>{greeting()}, Ismail</h1>
        </div>
        <div className={styles.actions}>
          <Link className="btn btn-secondary" href="/admin/writing">
            New post
          </Link>
          <Link className="btn btn-primary" href="/admin/projects">
            New project
          </Link>
        </div>
      </div>

      {studioWritable() ? null : (
        <div
          style={{
            border: "1px solid var(--color-accent-prose)",
            color: "var(--color-accent-prose)",
            padding: "12px 14px",
            fontSize: 13.5,
            marginBottom: 24,
          }}
        >
          Read-only. The site is rendering from the seeded content manifest  - 
          set <span className="tnum">NEXT_PUBLIC_SANITY_PROJECT_ID</span> and{" "}
          <span className="tnum">SANITY_API_WRITE_TOKEN</span> to save edits.
        </div>
      )}

      <div className={styles.metrics}>
        <Metric label="Published" value={metrics.published} />
        <Metric label="Drafts" value={metrics.drafts} />
        <Metric label="Missing screenshots" value={metrics.missingShots} alert />
        <Metric label="Placeholder write-ups" value={metrics.placeholderWriteups} />
      </div>

      <div className={styles.dashboard}>
        <div>
          <RecentTable rows={rows} />
        </div>
        <div>
          <div className="kick" style={{ marginBottom: 12 }}>
            Needs attention
          </div>
          <div className={styles.attention}>
            {attention.length ? (
              attention.map((item) => (
                <div key={item.text} className="card">
                  <div style={{ fontSize: 14 }}>{item.text}</div>
                  <Link href={item.href} style={{ fontSize: 13 }}>
                    {item.label}
                  </Link>
                </div>
              ))
            ) : (
              <div className={styles.emptyRail}>Nothing outstanding.</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function Metric({
  label,
  value,
  alert,
}: {
  label: string;
  value: number;
  alert?: boolean;
}) {
  return (
    <div className="card">
      <div className="card-kicker">{label}</div>
      <div
        className={`${styles.metricValue} ${alert && value > 0 ? styles.metricAlert : ""} tnum`}
      >
        {value}
      </div>
    </div>
  );
}

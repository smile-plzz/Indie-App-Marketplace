import { getVentures } from "@/lib/content";
import styles from "@/components/admin/admin.module.css";

/**
 * Ventures are two fixed records with long-form copy Ismail wrote once; the
 * design gives them a nav entry but no editor, so this lists what is live and
 * points at where the copy is authored rather than pretending to be a form.
 */
export default async function VenturesPage() {
  const ventures = await getVentures();

  return (
    <>
      <div className={styles.pageHead}>
        <div>
          <div className="kick">Ventures</div>
          <h1 className={styles.pageTitle}>Film &amp; drone</h1>
        </div>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Role</th>
            <th>Period</th>
            <th style={{ textAlign: "right" }}>Videos</th>
          </tr>
        </thead>
        <tbody>
          {ventures.map((venture) => (
            <tr key={venture.slug}>
              <td>{venture.name}</td>
              <td style={{ color: "var(--color-neutral-700)" }}>{venture.role}</td>
              <td className="tnum" style={{ color: "var(--color-neutral-700)" }}>
                {venture.period}
              </td>
              <td className="tnum" style={{ textAlign: "right" }}>
                {venture.videos.length}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p style={{ fontSize: 13, color: "var(--color-meta)", marginTop: 18 }}>
        Both ventures are closed and their copy is settled, so they are edited in
        the Sanity schema rather than here.
      </p>
    </>
  );
}

import { getCredentialGroups } from "@/lib/content";
import styles from "@/components/admin/admin.module.css";

/**
 * A register, not an editor  -  certificates are issued facts. Grouped the same
 * way the public accordion groups them, so the two never disagree.
 */
export default async function AdminCredentialsPage() {
  const groups = await getCredentialGroups();
  const total = groups.reduce((sum, group) => sum + group.items.length, 0);

  return (
    <>
      <div className={styles.pageHead}>
        <div>
          <div className="kick">Credentials</div>
          <h1 className={styles.pageTitle}>
            <span className="tnum">{total}</span> certificates,{" "}
            <span className="tnum">{groups.length}</span> issuers
          </h1>
        </div>
      </div>

      {groups.map((group) => (
        <section key={group.group} style={{ marginBottom: 28 }}>
          <div className="kick" style={{ marginBottom: 8 }}>
            {group.group} · <span className="tnum">{group.items.length}</span>
          </div>
          <table className="table">
            <tbody>
              {group.items.map((item) => (
                <tr key={item.name}>
                  <td>{item.name}</td>
                  <td className="tnum" style={{ textAlign: "right", color: "var(--color-meta)" }}>
                    {item.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}
    </>
  );
}

import { adminMedia, adminProjects } from "@/lib/admin-content";
import { studioWritable } from "@/lib/admin";
import { MediaLibrary } from "@/components/admin/MediaLibrary";
import styles from "@/components/admin/admin.module.css";

export default async function MediaPage() {
  const [assets, projects] = await Promise.all([adminMedia(), adminProjects()]);
  const missing = projects.filter((project) => !project.shot?.url).length;

  return (
    <>
      <div className={styles.pageHead}>
        <div>
          <div className="kick">Media</div>
          <h1 className={styles.pageTitle}>Library</h1>
        </div>
        {missing ? (
          <div style={{ fontSize: 13, color: "var(--color-accent-prose)" }}>
            <span className="tnum">{missing}</span> projects still have no
            screenshot.
          </div>
        ) : null}
      </div>
      <MediaLibrary assets={assets} writable={studioWritable()} />
    </>
  );
}

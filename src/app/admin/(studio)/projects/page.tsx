import { adminProjects } from "@/lib/admin-content";
import { studioWritable } from "@/lib/admin";
import { ProjectList } from "@/components/admin/ProjectList";
import styles from "@/components/admin/admin.module.css";

export default async function AdminProjectsPage() {
  const projects = await adminProjects();

  return (
    <>
      <div className={styles.pageHead}>
        <div>
          <div className="kick">Projects</div>
          <h1 className={styles.pageTitle}>
            <span className="tnum">{projects.length}</span> projects
          </h1>
        </div>
      </div>
      <ProjectList projects={projects} writable={studioWritable()} />
    </>
  );
}

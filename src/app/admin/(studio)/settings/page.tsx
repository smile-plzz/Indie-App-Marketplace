import { adminSettings } from "@/lib/admin-content";
import { studioWritable } from "@/lib/admin";
import { SettingsForm } from "@/components/admin/SettingsForm";
import styles from "@/components/admin/admin.module.css";

export default async function SettingsPage() {
  const settings = await adminSettings();

  return (
    <>
      <div className={styles.pageHead}>
        <div>
          <div className="kick">Settings</div>
          <h1 className={styles.pageTitle}>Site</h1>
        </div>
      </div>
      <SettingsForm settings={settings} writable={studioWritable()} />
    </>
  );
}

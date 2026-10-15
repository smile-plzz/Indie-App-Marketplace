import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AdminNav } from "@/components/admin/AdminNav";
import { SignOut } from "@/components/admin/SignOut";
import { ToastProvider } from "@/components/admin/Toast";
import { adminMedia, adminPosts, adminProjects } from "@/lib/admin-content";
import { getCredentials, getVentures } from "@/lib/content";
import { studioWritable } from "@/lib/admin";
import styles from "@/components/admin/admin.module.css";
/** The studio reads live documents; nothing here may be prerendered. */
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
    title: "Studio",
    robots: { index: false, follow: false },
};
export default async function StudioLayout({ children }: {
    children: ReactNode;
}) {
    const [projects, posts, ventures, credentials, media] = await Promise.all([
        adminProjects(),
        adminPosts(),
        getVentures(),
        getCredentials(),
        adminMedia(),
    ]);
    const items = [
        { label: "Overview", href: "/admin" },
        { label: "Orders & Store", href: "/admin/orders" },
        { label: "Apps & Pricing", href: "/admin/products" },
    { label: "Operations", href: "/admin/operations" },
        { label: "Projects", href: "/admin/projects", count: projects.length },
        { label: "Writing", href: "/admin/writing", count: posts.length },
        { label: "Ventures", href: "/admin/ventures", count: ventures.length },
        { label: "Credentials", href: "/admin/credentials", count: credentials.length },
        { label: "Media", href: "/admin/media", count: media.length },
        { label: "Settings", href: "/admin/settings" },
    ];
    return (<ToastProvider>
      <div className={styles.shell}>
        <aside className={styles.rail}>
          <div className={styles.brand}>
            <div className={styles.brandName}>Studio</div>
            <div className="kick">ismailhossain.dev</div>
          </div>

          <AdminNav items={items}/>

          <div className={styles.railFoot}>
            <div>
              Content:{" "}
              <span style={{
            color: studioWritable()
                ? "var(--color-accent-prose)"
                : "var(--color-meta)",
        }}>
                {studioWritable() ? "connected" : "read-only"}
              </span>
              <br />
              <span className="tnum">
                {projects.length} projects · {posts.length} posts
              </span>
            </div>
            <SignOut />
          </div>
        </aside>

        <div className={styles.content}>{children}</div>
      </div>
    </ToastProvider>);
}

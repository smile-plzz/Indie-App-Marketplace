import { adminPosts } from "@/lib/admin-content";
import { studioWritable } from "@/lib/admin";
import { PostList } from "@/components/admin/PostList";
import styles from "@/components/admin/admin.module.css";

export default async function AdminWritingPage() {
  const posts = await adminPosts();

  return (
    <>
      <div className={styles.pageHead}>
        <div>
          <div className="kick">Writing</div>
          <h1 className={styles.pageTitle}>
            <span className="tnum">{posts.length}</span>{" "}
            {posts.length === 1 ? "post" : "posts"}
          </h1>
        </div>
      </div>
      <PostList posts={posts} writable={studioWritable()} />
    </>
  );
}

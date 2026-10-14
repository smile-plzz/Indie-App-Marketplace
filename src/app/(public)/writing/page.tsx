import Link from "next/link";
import type { Metadata } from "next";
import { getPosts } from "@/lib/content";
import { formatShortDate } from "@/lib/date";
import styles from "./writing.module.css";

export const metadata: Metadata = {
  title: "Writing",
  description: "Notes as they happen, essays when they earn it.",
};

export default async function WritingPage() {
  const posts = await getPosts();

  return (
    <>
      <div className={styles.head}>
        <div className="kick">Writing</div>
        <h1 className={`display ${styles.title}`}>
          Notes as they happen, essays when they earn it.
        </h1>
        <p className={styles.standfirst}>
          Short entries stay inline; longer pieces get their own page. Length is
          the only distinction.
        </p>
      </div>

      {posts.length ? (
        <div className={styles.feed}>
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/writing/${post.slug}`}
              className={`rowlink ${styles.row}`}
            >
              <span className={`kick tnum ${styles.date}`}>
                {formatShortDate(post.date)}
              </span>
              <span style={{ flex: 1 }}>
                <span className={styles.rowTitle}>{post.title}</span>
                {post.summary ? (
                  <span className={styles.rowBlurb}>{post.summary}</span>
                ) : null}
              </span>
              <span className={`kick ${styles.kind}`}>
                {post.kind}
                {post.readingMinutes ? ` · ${post.readingMinutes} min` : ""}
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <div className={styles.empty}>
          <div style={{ fontFamily: "var(--font-heading)", fontSize: 22 }}>
            No posts yet
          </div>
          <p
            style={{
              fontSize: 14,
              color: "var(--color-neutral-700)",
              margin: "6px 0 0",
            }}
          >
            The nav link stays hidden until the first post publishes.
          </p>
        </div>
      )}
    </>
  );
}

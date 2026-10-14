import Link from "next/link";
import { isValidElement, type ReactNode } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import { JsonLd } from "@/components/JsonLd";
import { getPost, getPostNeighbours, getPosts } from "@/lib/content";
import { absolute } from "@/lib/site";
import { formatLongDate } from "@/lib/date";
import styles from "./post.module.css";

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.summary,
    alternates: { canonical: `/writing/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.summary,
      publishedTime: post.date,
    },
  };
}

/** Post body renders through the site's own type styles  -  nothing new enters. */
const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p className="lead">{children}</p>,
    // The contents rail links to these, so the id has to match its slug.
    h2: ({ children }) => (
      <h2 id={slugify(toText(children))} className={styles.h2}>
        {children}
      </h2>
    ),
    h3: ({ children }) => <h3 className={styles.h3}>{children}</h3>,
    blockquote: ({ children }) => (
      <blockquote className={styles.quote}>{children}</blockquote>
    ),
  },
  marks: {
    link: ({ children, value }) => (
      <a href={value?.href} target="_blank" rel="noreferrer">
        {children}
      </a>
    ),
  },
};

export default async function PostPage({ params }: Params) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const { prev, next } = await getPostNeighbours(slug);
  const headings = extractHeadings(post.body);

  return (
    <article>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.summary,
          datePublished: post.date,
          url: absolute(`/writing/${post.slug}`),
          keywords: post.tags?.join(", "),
          author: { "@type": "Person", name: "Md. Ismail Hossain" },
        }}
      />
      <div className={styles.topbar}>
        <Link href="/writing" style={{ fontSize: 13 }}>
          ← All writing
        </Link>
      </div>

      <header className={styles.header}>
        <div className="kick tnum">
          {formatLongDate(post.date)} · {post.kind}
          {post.readingMinutes ? ` · ${post.readingMinutes} min` : ""}
        </div>
        <h1 className={`display ${styles.title}`}>{post.title}</h1>
      </header>

      <div className={styles.body}>
        <div className={styles.prose}>
          <PortableText value={post.body as never} components={components} />
        </div>

        <aside className={styles.rail}>
          {headings.length ? (
            <>
              <div className="kick" style={{ marginBottom: 8 }}>
                Contents
              </div>
              {headings.map((heading) => (
                <div key={heading.id}>
                  <a href={`#${heading.id}`}>{heading.text}</a>
                </div>
              ))}
            </>
          ) : null}
          {post.tags?.length ? (
            <>
              {headings.length ? <div className="hr" style={{ margin: "16px 0" }} /> : null}
              <div className="kick" style={{ marginBottom: 8 }}>
                Tags
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {post.tags.map((tag) => (
                  <span key={tag} className="tag tag-outline">
                    {tag}
                  </span>
                ))}
              </div>
            </>
          ) : null}
        </aside>
      </div>

      {prev || next ? (
        <nav className={styles.prevnext} aria-label="Post navigation">
          {prev ? (
            <Link href={`/writing/${prev.slug}`} className={`rowlink ${styles.prev}`}>
              <span className="kick">← Previous</span>
              <span className={styles.neighbourTitle}>{prev.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link href={`/writing/${next.slug}`} className={`rowlink ${styles.next}`}>
              <span className="kick">Next →</span>
              <span className={styles.neighbourTitle}>{next.title}</span>
            </Link>
          ) : (
            <span />
          )}
        </nav>
      ) : null}
    </article>
  );
}

type Heading = { id: string; text: string };

function extractHeadings(body: unknown): Heading[] {
  if (!Array.isArray(body)) return [];
  return body
    .filter(
      (block): block is { style: string; children: { text: string }[] } =>
        typeof block === "object" &&
        block !== null &&
        "style" in block &&
        (block as { style?: string }).style === "h2",
    )
    .map((block) => {
      const text = block.children?.map((c) => c.text).join("") ?? "";
      return { id: slugify(text), text };
    })
    .filter((h) => h.text);
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

/** Portable Text hands headings a React node tree; the id needs the plain text. */
function toText(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(toText).join("");
  if (isValidElement(node)) {
    return toText((node.props as { children?: ReactNode }).children);
  }
  return "";
}

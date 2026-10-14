import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { ProjectDetailView } from "@/components/ProjectDetail";
import { getProject, getProjectNeighbours, getProjects } from "@/lib/content";
import { absolute } from "@/lib/site";
import styles from "@/components/ProjectDetail.module.css";

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.summary,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: {
      type: "article",
      title: project.title,
      description: project.summary,
      url: absolute(`/projects/${project.slug}`),
    },
  };
}

export default async function ProjectPage({ params }: Params) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();

  const { prev, next, index, total } = await getProjectNeighbours(slug);

  return (
    <article>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CreativeWork",
          name: project.title,
          description: project.summary,
          url: absolute(`/projects/${project.slug}`),
          dateCreated: project.year || undefined,
          keywords: project.tags.join(", "),
          author: { "@type": "Person", name: "Md. Ismail Hossain" },
          ...(project.liveUrl ? { sameAs: [project.liveUrl] } : {}),
        }}
      />

      <div className={styles.topbar}>
        <Link href="/projects" style={{ fontSize: 13 }}>
          ← All projects
        </Link>
        <span className="kick tnum">
          {String(index).padStart(2, "0")} / {total}
        </span>
      </div>

      <ProjectDetailView project={project} priority />

      <nav className={styles.prevnext} aria-label="Project navigation">
        {prev ? (
          <Link href={`/projects/${prev.slug}`} className={`rowlink ${styles.prev}`}>
            <span className="kick">← Previous</span>
            <span className={styles.neighbourTitle}>{prev.title}</span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/projects/${next.slug}`} className={`rowlink ${styles.next}`}>
            <span className="kick">Next →</span>
            <span className={styles.neighbourTitle}>{next.title}</span>
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </article>
  );
}

import Link from "next/link";
import { Section } from "@/components/Section";
import { ProjectCard } from "@/components/ProjectCard";
import { ThumbPlate } from "@/components/Plate";
import { ContactForm } from "@/components/ContactForm";
import { VisitorCount } from "@/components/VisitorCount";
import { Reveal } from "@/components/Reveal";
import { JsonLd } from "@/components/JsonLd";
import { absolute } from "@/lib/site";
import { formatShortDate } from "@/lib/date";
import {
  getCredentialCounts,
  getExperiences,
  getFeaturedProjects,
  getPosts,
  getProjects,
  getSettings,
  getSkillGroups,
  getVentures,
} from "@/lib/content";
import styles from "./home.module.css";

/** Image heights for the four secondary cards, authored per the design. */
const GRID_HEIGHTS = [220, 280, 170, 240];

export default async function HomePage() {
  const [
    settings,
    skillGroups,
    featured,
    allProjects,
    experiences,
    ventures,
    posts,
    counts,
  ] = await Promise.all([
    getSettings(),
    getSkillGroups(),
    getFeaturedProjects(),
    getProjects(),
    getExperiences(),
    getVentures(),
    getPosts(),
    getCredentialCounts(),
  ]);

  const [lead, ...rest] = featured;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Person",
          name: settings.name,
          jobTitle: settings.role,
          email: `mailto:${settings.email}`,
          telephone: settings.phoneHref,
          url: absolute("/"),
          address: {
            "@type": "PostalAddress",
            addressLocality: settings.locationShort,
          },
          sameAs: Object.values(settings.links),
          knowsAbout: skillGroups.flatMap((group) =>
            group.items.map((item) => item.name),
          ),
        }}
      />
      <section className={styles.hero}>
        <div className="kick">{settings.name}</div>
        <h1 className={`display ${styles.heroTitle}`}>{settings.positioning}</h1>
        <div className={styles.heroActions}>
          <a
            className="btn btn-primary"
            href={settings.resumeUrl}
            target="_blank"
            rel="noreferrer"
          >
            Download résumé
          </a>
          <a className="btn btn-secondary" href={`mailto:${settings.email}`}>
            {settings.email}
          </a>
        </div>
      </section>

      <Section kicker="About">
        <Reveal>
          {settings.about.map((paragraph, i) => (
            <p
              key={i}
              className="lead"
              style={i === settings.about.length - 1 ? { marginBottom: 0 } : undefined}
            >
              {paragraph}
            </p>
          ))}

          <div className={styles.skills}>
            {skillGroups.map((group) => (
              <div key={group.label}>
                <div className="kick" style={{ marginBottom: 8 }}>
                  {group.label}
                </div>
                <div className={styles.tagRow}>
                  {group.items.map((item) => (
                    <span
                      key={item.name}
                      className={`tag ${item.accent ? "tag-accent" : "tag-outline"}`}
                    >
                      {item.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <Link
            href="/credentials"
            style={{ fontSize: 13, display: "inline-block", marginTop: 20 }}
          >
            All skills &amp; credentials →
          </Link>
        </Reveal>
      </Section>

      <Section
        variant="full"
        kicker="Selected work"
        action={
          <Link href="/projects" style={{ fontSize: 13 }}>
            All {allProjects.length} projects →
          </Link>
        }
      >
        <div className={styles.projectGrid}>
          {lead ? (
            <ProjectCard
              project={lead}
              variant="featured"
              imageHeight={320}
              showYear
            />
          ) : null}
          {rest.map((project, i) => (
            <div
              key={project.slug}
              className={i >= 2 ? styles.selfStart : undefined}
            >
              <ProjectCard
                project={project}
                variant="grid"
                imageHeight={GRID_HEIGHTS[i] ?? 220}
              />
            </div>
          ))}
        </div>
      </Section>

      <Section kicker="Experience">
        <div className={styles.experience}>
          {experiences.map((job, i) => (
            <div key={job.role}>
              {i > 0 ? <div className="hr" style={{ margin: "0 0 36px" }} /> : null}
              <div className={styles.roleHead}>
                <h3 className="display" style={{ fontSize: 25, margin: 0 }}>
                  {job.role}
                </h3>
                <span className="kick tnum" style={{ whiteSpace: "nowrap" }}>
                  {job.period}
                </span>
              </div>
              <div
                style={{
                  fontSize: 14,
                  color: "var(--color-neutral-700)",
                  margin: "6px 0 14px",
                }}
              >
                {job.org}
                {job.orgNote ? ` · ${job.orgNote}` : ""}
              </div>
              <ul className={styles.bullets}>
                {job.bullets.map((bullet, j) => (
                  <li key={j}>{bullet}</li>
                ))}
              </ul>
              {job.links.length ? (
                <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
                  {job.links.map((link) => (
                    <a
                      key={link.url}
                      className="btn btn-secondary"
                      style={{ fontSize: 13 }}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </Section>

      <Section
        variant="full"
        kicker="Film & drone"
        action={
          <Link href="/film" style={{ fontSize: 13 }}>
            All productions →
          </Link>
        }
      >
        <h3
          className="display"
          style={{ fontSize: 32, margin: "0 0 28px", maxWidth: "26ch" }}
        >
          Two ventures, run end to end  -  a music label and a production house.
        </h3>
        <div className={styles.filmGrid}>
          {ventures.map((venture) => (
            <article key={venture.slug}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  gap: 16,
                }}
              >
                <h4 className="display" style={{ fontSize: 20, margin: 0 }}>
                  {venture.name}
                </h4>
                <span className="kick tnum">{venture.periodShort}</span>
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "var(--color-meta)",
                  margin: "4px 0 12px",
                }}
              >
                {venture.role}
              </div>
              <p
                style={{
                  fontSize: 14,
                  lineHeight: 1.65,
                  color: "var(--color-neutral-800)",
                }}
              >
                {venture.homeBlurb}
              </p>
              <div className={styles.thumbGrid}>
                {venture.videos.map((video) => (
                  <a
                    key={video.id}
                    href={`https://www.youtube.com/watch?v=${video.id}`}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={video.title}
                  >
                    <ThumbPlate
                      src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
                      alt={video.title}
                      height={104}
                    />
                  </a>
                ))}
              </div>
            </article>
          ))}
        </div>
      </Section>

      {posts.length ? (
        <Section kicker="Writing">
          {posts.slice(0, 3).map((post, i) => (
            <Link
              key={post.slug}
              href={`/writing/${post.slug}`}
              className="rowlink"
              style={
                i === 0 ? { borderTop: "1px solid var(--color-divider)" } : undefined
              }
            >
              <span className="kick tnum" style={{ width: 92, flex: "none" }}>
                {formatShortDate(post.date)}
              </span>
              <span
                style={{ fontFamily: "var(--font-heading)", fontSize: 19, flex: 1 }}
              >
                {post.title}
              </span>
              <span className="kick">
                {post.kind}
                {post.readingMinutes ? ` · ${post.readingMinutes} min` : ""}
              </span>
            </Link>
          ))}
          <Link
            href="/writing"
            style={{ fontSize: 13, display: "inline-block", marginTop: 18 }}
          >
            All writing →
          </Link>
        </Section>
      ) : null}

      <Section kicker="Credentials">
        <div className={styles.metrics}>
          <div className={styles.metricRow}>
            <Metric value={counts.degrees} label="Degrees" />
            <Metric value={counts.certifications} label="Certifications" />
            <Metric value={counts.publications} label="Publications" />
            <Metric value={counts.academicProjects} label="Academic projects" />
          </div>
          <Link className="btn btn-primary" href="/credentials">
            Education, certifications &amp; research →
          </Link>
        </div>
      </Section>

      <Section kicker="Contact" id="contact" last>
        <div className={styles.contactGrid}>
          <div>
            <h3 className="display" style={{ fontSize: 32, margin: "0 0 14px" }}>
              {settings.contactHeadline}
            </h3>
            <ContactForm
              endpoint={settings.formspreeEndpoint}
              email={settings.email}
              phone={settings.phone}
              phoneHref={settings.phoneHref}
            />
          </div>
          <div className={styles.contactDetails}>
            <div>
              <a href={`mailto:${settings.email}`}>{settings.email}</a>
            </div>
            <div className="tnum">
              <a href={`tel:${settings.phoneHref}`}>{settings.phone}</a>
            </div>
            <div>{settings.location}</div>
            <div style={{ marginTop: 14, display: "flex", gap: 14, flexWrap: "wrap" }}>
              <a href={settings.links.linkedin} target="_blank" rel="noreferrer">
                LinkedIn
              </a>
              <a href={settings.links.github} target="_blank" rel="noreferrer">
                GitHub
              </a>
              <a href={settings.links.youtube} target="_blank" rel="noreferrer">
                YouTube
              </a>
              <a href={settings.links.facebook} target="_blank" rel="noreferrer">
                Facebook
              </a>
            </div>
          </div>
        </div>
      </Section>

      <footer className={styles.footer}>
        <span>© {new Date().getFullYear()} {settings.name}</span>
        <VisitorCount src={settings.visitorBadgeUrl} />
      </footer>
    </>
  );
}

function Metric({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <div className={`${styles.metricValue} tnum`}>{value}</div>
      <div className="kick">{label}</div>
    </div>
  );
}


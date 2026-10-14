import type { Metadata } from "next";
import { Section } from "@/components/Section";
import { CredentialAccordion } from "@/components/CredentialAccordion";
import {
  getAcademicProjects,
  getCredentialGroups,
  getCredentials,
  getEducation,
  getExtraCurricular,
  getPublications,
  getSecondaryEducation,
} from "@/lib/content";
import styles from "./credentials.module.css";

export const metadata: Metadata = {
  title: "Credentials",
  description: "Degrees, certificates and papers.",
};

export default async function CredentialsPage() {
  const [
    education,
    secondary,
    groups,
    allCredentials,
    academic,
    publications,
    extra,
  ] = await Promise.all([
    getEducation(),
    getSecondaryEducation(),
    getCredentialGroups(),
    getCredentials(),
    getAcademicProjects(),
    getPublications(),
    getExtraCurricular(),
  ]);

  return (
    <>
      <div className={styles.head}>
        <div className="kick">Credentials</div>
        <h1 className={`display ${styles.title}`}>
          Degrees, certificates and papers.
        </h1>
      </div>

      <Section kicker="Education">
        <div className={styles.stack}>
          {education.map((degree, i) => (
            <div key={degree.degree}>
              {i > 0 ? <div className="hr" style={{ margin: "0 0 22px" }} /> : null}
              <div className={styles.rowHead}>
                <h2 className="display" style={{ fontSize: 25, margin: 0 }}>
                  {degree.degree}
                </h2>
                <span className="kick tnum">{degree.period}</span>
              </div>
              <div className={styles.institution}>
                {degree.institution}
                {degree.department ? ` · ${degree.department}` : ""} ·{" "}
                <span className="tnum">{degree.gpa}</span>
              </div>
              <div className={styles.tagRow}>
                {degree.coursework.map((course) => (
                  <span key={course} className="tag tag-outline">
                    {course}
                  </span>
                ))}
              </div>
            </div>
          ))}

          <div className={styles.secondary}>
            {secondary.map((school, i) => (
              <span key={school.school}>
                {i > 0 ? " · " : ""}
                {school.school}, {school.qualification} {school.year}, GPA{" "}
                <span className="tnum">{school.gpa}</span>
              </span>
            ))}
          </div>
        </div>
      </Section>

      <Section
        kicker="Certifications"
        railExtra={
          <div className={styles.railNote}>
            {allCredentials.length}, {groups.length} issuers
          </div>
        }
      >
        <CredentialAccordion groups={groups} />
      </Section>

      <Section kicker="Academic projects">
        {academic.map((project) => (
          <div key={project.title} className={styles.academicItem}>
            <div className={styles.rowHead}>
              <h3 className="display" style={{ fontSize: 20, margin: 0 }}>
                {project.title}
              </h3>
              <span className="kick" style={{ whiteSpace: "nowrap" }}>
                {project.kind}
              </span>
            </div>
            <p className={styles.academicDesc}>{project.description}</p>
            <div className={styles.academicStack}>{project.stack}</div>
          </div>
        ))}
      </Section>

      <Section kicker="Research">
        <div className={styles.researchGrid}>
          {publications.map((paper) => (
            <div key={paper.title} className="card">
              <div className="card-title" style={{ fontSize: 20 }}>
                {paper.title}
              </div>
              <div className="card-body" style={{ fontSize: 13.5 }}>
                {paper.authors}
              </div>
              <div className="card-meta">
                Supervisor: {paper.supervisor} · {paper.institution}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section kicker="Extra-curricular" last>
        <div className={styles.extraGrid}>
          {extra.map((item) => (
            <div key={item.title} className={styles.extraItem}>
              <span className={styles.extraTitle}>{item.title}</span>  - {" "}
              {item.description}{" "}
              {item.linkUrl ? (
                <a href={item.linkUrl} target="_blank" rel="noreferrer">
                  {item.linkLabel}
                </a>
              ) : null}
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}

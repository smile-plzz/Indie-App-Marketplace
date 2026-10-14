import type { Metadata } from "next";
import { Section } from "@/components/Section";
import { ThumbPlate } from "@/components/Plate";
import { Emphasis } from "@/components/Emphasis";
import { getVentures } from "@/lib/content";
import styles from "./film.module.css";

export const metadata: Metadata = {
  title: "Film & Drone",
  description:
    "Two ventures, run end to end  -  a music label that paid its artists, and a production house of one.",
};

export default async function FilmPage() {
  const ventures = await getVentures();

  return (
    <>
      <div className={styles.head}>
        <div className="kick">Film &amp; drone</div>
        <h1 className={`display ${styles.title}`}>Two ventures, run end to end.</h1>
        <p className={styles.standfirst}>
          A music label that paid its artists, and a production house of one.
          Both closed; the work stands.
        </p>
      </div>

      {ventures.map((venture, i) => (
        <Section
          key={venture.slug}
          kicker={venture.name}
          last={i === ventures.length - 1}
          railExtra={
            <div className={styles.railMeta}>
              {venture.role}
              <br />
              <span className="tnum">{venture.period}</span>
            </div>
          }
        >
          <p className="lead">{venture.lead}</p>
          <ul className={styles.bullets}>
            {venture.bullets.map((bullet, j) => (
              <li key={j}>
                <Emphasis text={bullet} />
              </li>
            ))}
          </ul>

          <div className={styles.videoGrid}>
            {venture.videos.map((video) => (
              <figure key={video.id}>
                <a
                  href={`https://www.youtube.com/watch?v=${video.id}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ThumbPlate
                    src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
                    alt={video.title}
                    height={118}
                  />
                </a>
                <figcaption>{video.title}</figcaption>
              </figure>
            ))}
          </div>
        </Section>
      ))}
    </>
  );
}

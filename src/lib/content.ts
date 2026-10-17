import { cache } from "react";
import { publishedReadClient, sanityConfigured } from "./sanity";
import * as seed from "@/content/manifest";
import type {
  AcademicProject,
  Credential,
  Experience,
  ExtraCurricular,
  Post,
  Project,
  Publication,
  SiteSettings,
  Venture,
} from "./types";

const client = publishedReadClient();

const PROJECT_FIELDS = `
  "slug": slug.current, title, year, summary, category, tags, liveUrl, repoUrl,
  role, stack, featured, order, imageHeight, placeholderCopy,
  problem, approach, outcome,
  "shot": shot{ "url": asset->url, alt, "width": asset->metadata.dimensions.width,
                "height": asset->metadata.dimensions.height }
`;

async function query<T>(groq: string, fallback: T, params = {}): Promise<T> {
  if (!client || !sanityConfigured) return fallback;
  try {
    const result = await client.fetch<T>(groq, params, {
      next: { revalidate: 60, tags: ["content"] },
    });
    // An unseeded dataset should show the site, not a blank page.
    if (result === null || (Array.isArray(result) && result.length === 0)) {
      return fallback;
    }
    return result;
  } catch {
    return fallback;
  }
}

export const getSettings = cache(
  async (): Promise<SiteSettings> =>
    query(
      `*[_type == "siteSettings"][0]{
        name, positioning, role, location, locationShort, availability, about,
        email, phone, phoneHref, resumeUrl, links, formspreeEndpoint,
        visitorBadgeUrl, contactHeadline,
        "portrait": portrait{ "url": asset->url, alt }
      }`,
      seed.siteSettings,
    ),
);

export const getProjects = cache(
  async (): Promise<Project[]> =>
    query(
      `*[_type == "project" && !hidden] | order(order asc){ ${PROJECT_FIELDS} }`,
      seed.projects,
    ),
);

export const getFeaturedProjects = cache(async (): Promise<Project[]> => {
  const all = await getProjects();
  return all.filter((p) => p.featured).slice(0, 5);
});

export const getProject = cache(
  async (slug: string): Promise<Project | null> => {
    const all = await getProjects();
    return all.find((p) => p.slug === slug) ?? null;
  },
);

/** Prev/next walk the same ordered list the index shows. */
export const getProjectNeighbours = cache(async (slug: string) => {
  const all = await getProjects();
  const i = all.findIndex((p) => p.slug === slug);
  if (i === -1) return { prev: null, next: null, index: 0, total: all.length };
  return {
    prev: i > 0 ? all[i - 1] : all[all.length - 1],
    next: i < all.length - 1 ? all[i + 1] : all[0],
    index: i + 1,
    total: all.length,
  };
});

export const getExperiences = cache(
  async (): Promise<Experience[]> =>
    query(
      `*[_type == "experience"] | order(order asc){
        order, role, org, orgNote, period, bullets, links
      }`,
      seed.experiences,
    ),
);

export const getVentures = cache(
  async (): Promise<Venture[]> =>
    query(
      `*[_type == "venture"] | order(order asc){
        order, "slug": slug.current, name, shortName, role, period, periodShort,
        lead, homeBlurb, bullets, videos
      }`,
      seed.ventures,
    ),
);

export const getCredentials = cache(
  async (): Promise<Credential[]> =>
    query(
      `*[_type == "credential"]{ group, issuer, name, date, verifyUrl }`,
      seed.credentials,
    ),
);

/** Grouped by issuer, count visible  -  the one accordion on the site. */
export const getCredentialGroups = cache(async () => {
  const all = await getCredentials();
  const order = [
    "Anthropic  -  AI & Automation",
    "Atlassian Ecosystem",
    "National Skills Development Authority",
    "Cisco Networking Academy",
    "British Council Bangladesh",
  ];
  const byGroup = new Map<string, Credential[]>();
  for (const c of all) {
    const list = byGroup.get(c.group) ?? [];
    list.push(c);
    byGroup.set(c.group, list);
  }
  return [...byGroup.entries()]
    .sort((a, b) => {
      const ai = order.indexOf(a[0]);
      const bi = order.indexOf(b[0]);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    })
    .map(([group, items]) => ({ group, items }));
});

export const getAcademicProjects = cache(
  async (): Promise<AcademicProject[]> =>
    query(
      `*[_type == "academicProject"] | order(order asc){ order, title, kind, description, stack }`,
      seed.academicProjects,
    ),
);

export const getPublications = cache(
  async (): Promise<Publication[]> =>
    query(
      `*[_type == "publication"] | order(order asc){ order, title, authors, supervisor, institution }`,
      seed.publications,
    ),
);

export const getExtraCurricular = cache(
  async (): Promise<ExtraCurricular[]> =>
    query(
      `*[_type == "extraCurricular"] | order(order asc){ order, title, description, linkLabel, linkUrl }`,
      seed.extraCurricular,
    ),
);

export const getPosts = cache(
  async (): Promise<Post[]> =>
    query(
      `*[_type == "post" && !(_id in path("drafts.**"))] | order(date desc){
        "slug": slug.current, title, date, kind, summary, readingMinutes, tags, body
      }`,
      seed.posts as Post[],
    ),
);

export const getPost = cache(async (slug: string): Promise<Post | null> => {
  const all = await getPosts();
  return all.find((p) => p.slug === slug) ?? null;
});

export const getPostNeighbours = cache(async (slug: string) => {
  const all = await getPosts();
  const i = all.findIndex((p) => p.slug === slug);
  if (i === -1) return { prev: null, next: null };
  return {
    prev: i > 0 ? all[i - 1] : null,
    next: i < all.length - 1 ? all[i + 1] : null,
  };
});

export const getEducation = cache(async () => seed.education);
export const getSecondaryEducation = cache(async () => seed.secondaryEducation);
export const getSkillGroups = cache(async () => seed.skillGroups);

/** Home's four numerals. Counted, never hardcoded. */
export const getCredentialCounts = cache(async () => {
  const [creds, academic, pubs] = await Promise.all([
    getCredentials(),
    getAcademicProjects(),
    getPublications(),
  ]);
  return {
    degrees: seed.education.length,
    certifications: creds.length,
    publications: pubs.length,
    academicProjects: academic.length,
  };
});

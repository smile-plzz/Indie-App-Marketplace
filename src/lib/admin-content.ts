import { adminReadClient } from "./sanity";
import * as seed from "@/content/manifest";
import type { Post, Project, SiteSettings } from "./types";

/**
 * The studio's own read layer. It needs `_id`, drafts and hidden documents  - 
 * none of which the public queries return  -  and it must never be cached, or
 * an editor would see their own save go missing. It reads through
 * `adminReadClient()`, not the public `client`: the public one is pinned to
 * `perspective: "published"`, which would make a freshly created draft
 * invisible to the editor that just created it.
 *
 * Without Sanity it projects the seed manifest into the same shape, using the
 * seed's deterministic ids, so the studio is browsable read-only.
 */

export type AdminDoc = { _id: string; _updatedAt?: string; _draft?: boolean };
export type AdminProject = Project & AdminDoc & { hidden?: boolean };
export type AdminPost = Post & AdminDoc;

function seedId(prefix: string, key: string) {
  return `${prefix}.${key.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

async function live<T>(groq: string, params: Record<string, unknown> = {}) {
  const client = adminReadClient();
  if (!client) return null;
  try {
    return await client.fetch<T>(groq, params, { cache: "no-store" });
  } catch {
    return null;
  }
}

const PROJECT_FIELDS = `
  _id, _updatedAt, "slug": slug.current, title, year, summary, category, tags,
  liveUrl, repoUrl, role, stack, featured, hidden, order, imageHeight,
  placeholderCopy, problem, approach, outcome,
  "shot": shot{ "url": asset->url, alt, "assetId": asset->_id }
`;

export async function adminProjects(): Promise<AdminProject[]> {
  const live_ = await live<AdminProject[]>(
    `*[_type == "project"] | order(order asc){ ${PROJECT_FIELDS} }`,
  );
  if (live_?.length) return live_;
  return seed.projects.map((project) => ({
    ...(project as Project),
    _id: seedId("project", project.slug),
    hidden: false,
  }));
}

export async function adminProject(id: string): Promise<AdminProject | null> {
  const all = await adminProjects();
  return all.find((project) => project._id === id) ?? null;
}

const POST_FIELDS = `
  _id, _updatedAt, "slug": slug.current, title, date, kind, summary,
  readingMinutes, tags, body
`;

export async function adminPosts(): Promise<AdminPost[]> {
  const live_ = await live<AdminPost[]>(
    `*[_type == "post"] | order(date desc){ ${POST_FIELDS} }`,
  );
  if (live_) {
    return live_.map((post) => ({
      ...post,
      _draft: post._id.startsWith("drafts."),
    }));
  }
  return [];
}

export async function adminPost(id: string): Promise<AdminPost | null> {
  const all = await adminPosts();
  return all.find((post) => post._id === id) ?? null;
}

export async function adminSettings(): Promise<SiteSettings & Partial<AdminDoc>> {
  const live_ = await live<(SiteSettings & AdminDoc) | null>(
    `*[_type == "siteSettings"][0]{
      _id, _updatedAt, name, positioning, role, location, locationShort,
      availability, about, email, phone, phoneHref, resumeUrl, links,
      formspreeEndpoint, visitorBadgeUrl, contactHeadline,
      "portrait": portrait{ "url": asset->url, alt, "assetId": asset->_id }
    }`,
  );
  return live_ ?? seed.siteSettings;
}

export type MediaAsset = {
  _id: string;
  url: string;
  originalFilename: string | null;
  size: number;
  width: number | null;
  height: number | null;
  usedBy: string[];
};

export async function adminMedia(): Promise<MediaAsset[]> {
  return (
    (await live<MediaAsset[]>(
      `*[_type == "sanity.imageAsset"] | order(_createdAt desc){
        _id, url, originalFilename, size,
        "width": metadata.dimensions.width,
        "height": metadata.dimensions.height,
        "usedBy": *[references(^._id)].title
      }`,
    )) ?? []
  );
}

/** The dashboard's four numerals, and the three things needing attention. */
export async function adminOverview() {
  const [projects, posts, settings, media] = await Promise.all([
    adminProjects(),
    adminPosts(),
    adminSettings(),
    adminMedia(),
  ]);

  const drafts = posts.filter((post) => post._draft).length;
  const missingShots = projects.filter((project) => !project.shot?.url).length;
  const placeholderWriteups = projects.filter(
    (project) => project.placeholderCopy,
  ).length;

  return {
    projects,
    posts,
    settings,
    mediaCount: media.length,
    metrics: {
      published: projects.filter((project) => !project.hidden).length + (posts.length - drafts),
      drafts,
      missingShots,
      placeholderWriteups,
    },
  };
}

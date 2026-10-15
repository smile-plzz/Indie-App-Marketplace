import { createClient, type SanityClient } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2024-10-01";

/**
 * Whether the content store is reachable. When it is not  -  a fresh clone with
 * no env, or CI  -  the data layer serves the seed manifest instead, so the site
 * renders the same content either way and there is no fixture to drift.
 */
export const sanityConfigured = Boolean(projectId);

export const client: SanityClient | null = sanityConfigured
  ? createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: true,
      perspective: "published",
    })
  : null;

/** Server data loaders may read namespaced records; publication filters still apply. */
export function publishedReadClient(): SanityClient | null {
  if (!client) return null;
  return client.withConfig({ token: process.env.SANITY_API_WRITE_TOKEN || undefined,
    useCdn: false, perspective: "published" });
}

/** Writes require the token; only ever constructed server-side. */
export function writeClient(): SanityClient {
  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (!projectId || !token) {
    throw new Error(
      "Sanity write client needs NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_API_WRITE_TOKEN",
    );
  }
  return createClient({
    projectId,
    dataset,
    apiVersion,
    token,
    useCdn: false,
  });
}

/**
 * The studio's read client  -  separate from the public `client` above, which
 * is deliberately pinned to `perspective: "published"` so a visitor never
 * sees a draft. The studio needs the opposite: `perspective: "raw"` so newly
 * created drafts (`drafts.*` ids) are visible the moment they're saved, plus
 * the write token so it reads past the CDN and past any dataset ACLs.
 * Returns null wherever `writeClient()` would throw  -  the studio falls back
 * to browsing the seed manifest read-only in that case.
 */
export function adminReadClient(): SanityClient | null {
  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (!projectId || !token) return null;
  return createClient({
    projectId,
    dataset,
    apiVersion,
    token,
    useCdn: false,
    perspective: "raw",
  });
}

const builder = sanityConfigured ? imageUrlBuilder({ projectId, dataset }) : null;

export function imageUrl(source: unknown, width: number, height?: number) {
  if (!builder || !source) return null;
  let url = builder.image(source as never).width(width).auto("format").fit("crop");
  if (height) url = url.height(height);
  return url.url();
}

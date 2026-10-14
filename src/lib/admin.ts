// Server-only: writeClient throws without a token, and nothing here is
// imported from a client component.
import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { sanityConfigured, writeClient } from "./sanity";

/**
 * Whether edits can actually be persisted. Without a Sanity project the site
 * still renders from the seed manifest, so the studio stays browsable and
 * read-only rather than pretending to save.
 */
export function studioWritable() {
  return sanityConfigured && Boolean(process.env.SANITY_API_WRITE_TOKEN);
}

export const READ_ONLY_MESSAGE =
  "Studio is read-only  -  set NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_API_WRITE_TOKEN to save.";

export function readOnlyResponse() {
  return NextResponse.json({ error: READ_ONLY_MESSAGE }, { status: 503 });
}

/** Only these fields may be written, per type. Anything else is dropped. */
export const WRITABLE_FIELDS = {
  project: [
    "title", "slug", "order", "year", "summary", "category", "tags", "liveUrl",
    "repoUrl", "role", "stack", "problem", "approach", "outcome",
    "placeholderCopy", "shot", "imageHeight", "featured", "hidden",
  ],
  post: ["title", "slug", "date", "kind", "summary", "readingMinutes", "tags", "body"],
  siteSettings: [
    "name", "positioning", "role", "location", "locationShort", "availability",
    "about", "email", "phone", "phoneHref", "resumeUrl", "links",
    "formspreeEndpoint", "visitorBadgeUrl", "contactHeadline", "portrait",
  ],
} as const;

export type WritableType = keyof typeof WRITABLE_FIELDS;

export function pickFields(type: WritableType, body: Record<string, unknown>) {
  const allowed = WRITABLE_FIELDS[type] as readonly string[];
  const out: Record<string, unknown> = {};
  for (const field of allowed) {
    if (field in body) out[field] = body[field];
  }
  return out;
}

export function slugValue(value: unknown) {
  const text = String(value ?? "").trim().toLowerCase();
  const current = text.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return current ? { _type: "slug", current } : undefined;
}

/**
 * Every public query is tagged "content", so one invalidation puts a save live
 * everywhere it appears  -  index, home grid and prev/next together.
 */
export async function commit<T>(work: (client: ReturnType<typeof writeClient>) => Promise<T>) {
  const result = await work(writeClient());
  revalidateTag("content");
  return result;
}

export function failure(error: unknown) {
  const message =
    error instanceof Error ? error.message : "The save did not go through.";
  return NextResponse.json({ error: message }, { status: 500 });
}

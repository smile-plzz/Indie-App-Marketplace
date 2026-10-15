import type { SanityClient } from "@sanity/client";
import githubDocuments from "../../../content/import/github-products.json";
import mediumDocuments from "../../../content/import/medium-posts.json";
import profileFields from "../../../content/import/profile-fields.json";
import { siteSettings } from "@/content/manifest";

type Document = { _id: string; _type: string; [key: string]: unknown };
export const preparedDocuments = [...githubDocuments, ...mediumDocuments] as Document[];

export function importSummary() {
  return preparedDocuments.reduce<Record<string, number>>((counts, doc) => {
    counts[doc._type] = (counts[doc._type] || 0) + 1;
    return counts;
  }, {});
}

/** Add records without replacing anything the owner has already edited. */
export async function importPreparedContent(client: SanityClient) {
  const existing = await client.fetch<Document[]>(`*[_id in $ids || _type == "siteSettings" ||
    (_type in ["product", "post", "project"] && slug.current in $slugs)]`, {
    ids: preparedDocuments.map(doc => doc._id),
    slugs: preparedDocuments.flatMap(doc => {
      const slug = doc.slug as { current?: string } | undefined;
      return slug?.current ? [slug.current] : [];
    }),
  });
  const ids = new Set(existing.map(doc => doc._id));
  const remap = new Map<string, string>();
  for (const doc of preparedDocuments) {
    const slug = (doc.slug as { current?: string } | undefined)?.current;
    const match = slug && existing.find(row => row._type === doc._type && (row.slug as { current?: string } | undefined)?.current === slug);
    if (match) remap.set(doc._id, match._id);
  }
  const transaction = client.transaction();
  const expectedIds = new Set<string>();
  let created = 0, preserved = 0;
  for (const source of preparedDocuments) {
    if (ids.has(source._id) || remap.has(source._id)) {
      expectedIds.add(remap.get(source._id) || source._id);
      preserved++; continue;
    }
    const doc = structuredClone(source);
    const product = doc.product as { _ref: string } | undefined;
    if (product && remap.has(product._ref)) product._ref = remap.get(product._ref)!;
    // Existing product reviews and releases belong to the owner; leave them intact.
    if (product && existing.some(row => row._id === product._ref) && ["licenseRecord", "release"].includes(doc._type)) { preserved++; continue; }
    transaction.createIfNotExists(doc);
    expectedIds.add(doc._id);
    created++;
  }
  const settings = existing.find(doc => doc._type === "siteSettings");
  let profileUpdated = false;
  if (!settings) {
    transaction.createIfNotExists({ _id: "siteSettings", _type: "siteSettings", ...siteSettings, ...profileFields,
      links: { ...siteSettings.links, ...profileFields.links } });
    created++;
    profileUpdated = true;
  } else {
    // Replace only known scaffold copy. Preserve authored profile text and all other settings.
    const updates: Record<string, unknown> = {};
    if (!(settings.links as { medium?: string } | undefined)?.medium) updates["links.medium"] = profileFields.links.medium;
    if (settings.positioning === siteSettings.positioning || !settings.positioning) updates.positioning = profileFields.positioning;
    if (settings.role === siteSettings.role || !settings.role) updates.role = profileFields.role;
    if (JSON.stringify(settings.about) === JSON.stringify(siteSettings.about) || !settings.about) updates.about = profileFields.about;
    if (settings.contactHeadline === siteSettings.contactHeadline || !settings.contactHeadline) updates.contactHeadline = profileFields.contactHeadline;
    if (Object.keys(updates).length) {
      transaction.patch(settings._id, { set: updates });
      profileUpdated = true;
    }
  }
  await transaction.commit();
  const saved = await client.fetch<Array<{ _id: string; _type: string }>>(`*[_id in $ids]{_id,_type}`, {
    ids: [...expectedIds],
  });
  if (saved.length !== expectedIds.size) throw new Error("Some imported records could not be verified. Retry safely to check existing records.");
  return { created, preserved, verifiedRecords: saved.length, expectedRecords: expectedIds.size,
    profileUpdated, summary: importSummary() };
}

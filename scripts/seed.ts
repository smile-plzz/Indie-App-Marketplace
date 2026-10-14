/**
 * Writes the real content manifest into Sanity. Idempotent  -  every document
 * gets a deterministic _id, so re-running updates rather than duplicating.
 *
 *   npm run seed
 *
 * Needs NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_API_WRITE_TOKEN in .env.local.
 */

import { createClient } from "@sanity/client";
import { readFileSync } from "node:fs";
import * as content from "../src/content/manifest";

// Load .env.local without a dependency  -  Node's --env-file is not on every
// version people run this with.
try {
  for (const line of readFileSync(".env.local", "utf8").split("\n")) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
  }
} catch {
  // No file  -  rely on the ambient environment.
}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !token) {
  console.error(
    "Missing NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_API_WRITE_TOKEN.",
  );
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2024-10-01",
  useCdn: false,
});

function id(prefix: string, key: string | number) {
  return `${prefix}.${String(key).toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

async function main() {
  const tx = client.transaction();

  tx.createOrReplace({
    _id: "siteSettings",
    _type: "siteSettings",
    ...content.siteSettings,
  });

  for (const p of content.projects) {
    const { slug, ...rest } = p;
    tx.createOrReplace({
      _id: id("project", slug),
      _type: "project",
      slug: { _type: "slug", current: slug },
      hidden: false,
      ...rest,
    });
  }

  for (const v of content.ventures) {
    const { slug, ...rest } = v;
    tx.createOrReplace({
      _id: id("venture", slug),
      _type: "venture",
      slug: { _type: "slug", current: slug },
      ...rest,
    });
  }

  for (const e of content.experiences) {
    tx.createOrReplace({
      _id: id("experience", e.order),
      _type: "experience",
      ...e,
    });
  }

  for (const c of content.credentials) {
    tx.createOrReplace({
      _id: id("credential", c.name),
      _type: "credential",
      ...c,
    });
  }

  for (const p of content.publications) {
    tx.createOrReplace({
      _id: id("publication", p.order),
      _type: "publication",
      ...p,
    });
  }

  for (const a of content.academicProjects) {
    tx.createOrReplace({
      _id: id("academicProject", a.order),
      _type: "academicProject",
      ...a,
    });
  }

  for (const x of content.extraCurricular) {
    tx.createOrReplace({
      _id: id("extraCurricular", x.order),
      _type: "extraCurricular",
      ...x,
    });
  }

  await tx.commit();

  const counts = {
    projects: content.projects.length,
    ventures: content.ventures.length,
    experiences: content.experiences.length,
    credentials: content.credentials.length,
    publications: content.publications.length,
    academicProjects: content.academicProjects.length,
    extraCurricular: content.extraCurricular.length,
  };
  console.log(`Seeded ${dataset}:`, counts);
  console.log(
    "\nStill needs real content: the positioning line, all fourteen project\n" +
      "write-ups, project screenshots, the portrait, and any writing posts.",
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

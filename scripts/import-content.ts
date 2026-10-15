import { createClient } from "@sanity/client";
import { writeFileSync } from "node:fs";
import { preparedDocuments, importPreparedContent, importSummary } from "../src/lib/marketplace/import-content";

async function main() {
if (!process.argv.includes("--apply")) {
  console.log(JSON.stringify({ mode: "preview", records: importSummary(), priceUSD: 2, priceBDT: 246.90,
    note: "Products are drafts. Existing edits will be preserved. Run with --apply after connecting Sanity." }, null, 2));
} else {
  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || !process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_WRITE_TOKEN === "[SENSITIVE]") {
    throw new Error("Connect valid Sanity credentials in the environment before importing. Do not paste credentials into chat.");
  }
  const client = createClient({ projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production", token: process.env.SANITY_API_WRITE_TOKEN,
    apiVersion: "2024-10-01", useCdn: false });
  const snapshot = await client.fetch(`*[_id in $ids || _type == "siteSettings"]`, { ids: preparedDocuments.map(doc => doc._id) });
  writeFileSync(".content-import-backup.json", JSON.stringify(snapshot, null, 2));
  console.log(JSON.stringify(await importPreparedContent(client), null, 2));
}

}
main().catch(error => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });


/** Shared date formatting for post dates across the home, writing index and post pages. */

/** "20 Aug 26"  -  used in list rows where space is tight. */
export function formatShortDate(iso: string) {
  return new Date(iso)
    .toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" })
    .replace(/,/g, "");
}

/** "20 August 2026"  -  used in the post header. */
export function formatLongDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

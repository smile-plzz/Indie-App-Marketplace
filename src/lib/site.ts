/**
 * The canonical origin. Vercel injects the deployment host, so previews get
 * absolute URLs that point at themselves rather than at production. Plain
 * `next dev` has neither, so it falls back to localhost rather than
 * production  -  otherwise canonical/sitemap/JSON-LD URLs generated while
 * developing locally would silently point at the live site.
 */
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_ENV === "production"
    ? "https://ismailhossain.dev"
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.VERCEL_ENV
        ? "https://ismailhossain.dev"
        : `http://localhost:${process.env.PORT ?? "3000"}`)
).replace(/\/$/, "");

export function absolute(path: string) {
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

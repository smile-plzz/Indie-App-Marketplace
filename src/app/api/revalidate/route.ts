import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export const runtime = "nodejs";

/**
 * Sanity webhook target. Every content query is tagged "content", so one
 * invalidation covers the whole site and a publish is live within a minute.
 */
export async function POST(request: Request) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Revalidation is not configured." }, { status: 503 });
  }

  const provided =
    request.headers.get("x-revalidate-secret") ??
    new URL(request.url).searchParams.get("secret");

  if (provided !== secret) {
    return NextResponse.json({ error: "Not authorised" }, { status: 401 });
  }

  revalidateTag("content");
  return NextResponse.json({ revalidated: true, at: Date.now() });
}

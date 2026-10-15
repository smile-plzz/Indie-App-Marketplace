import { NextResponse } from "next/server";
import { adminReadClient } from "@/lib/sanity";
import { POST as publishRelease } from "@/app/api/releases/publish/route";

// /api/admin is protected by the session middleware.
export async function GET() {
  const cms = adminReadClient();
  if (!cms) return NextResponse.json({ releases: [], configured: false });
  try {
    const releases = await cms.fetch(`*[_type == "release" && !(_id in path("drafts.**"))] | order(_createdAt desc)[0...100] { _id, version, releaseDate, sha256Checksum, installerFileKey, isSigned, malwareScanPassed, changelog, "slug": product->slug.current, "productTitle": product->title }`);
    return NextResponse.json({ releases, configured: true });
  } catch {
    return NextResponse.json({ error: "Unable to read releases" }, { status: 502 });
  }
}

export async function POST(req: Request) {
  if (req.headers.get("origin") !== new URL(req.url).origin) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  return publishRelease(new Request(req.url, {
    method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${process.env.RELEASE_PUBLISH_SECRET || ""}` }, body: await req.text(),
  }));
}

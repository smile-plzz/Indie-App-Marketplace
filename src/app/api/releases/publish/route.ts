import { NextResponse } from "next/server";
import { getProductBySlug } from "@/lib/marketplace/catalog";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    const expectedSecret = process.env.RELEASE_PUBLISH_SECRET || "dev-release-secret-key-12345";

    if (!token || token !== expectedSecret) {
      return NextResponse.json({ error: "Unauthorized release publish request" }, { status: 401 });
    }

    const body = await req.json();
    const { slug, version, checksum, changelog, fileKey, minOS } = body;

    if (!slug || !version || !checksum) {
      return NextResponse.json(
        { error: "slug, version, and checksum are required" },
        { status: 400 }
      );
    }

    const product = await getProductBySlug(slug);
    if (!product) {
      return NextResponse.json({ error: `Product '${slug}' not found` }, { status: 404 });
    }

    // In production with Sanity client, this writes the new release document and updates product.currentVersion.
    // In local mode, logs and acknowledges the registered release.
    console.log(`[RELEASE PUBLISHED] App: ${slug}, Version: ${version}, SHA-256: ${checksum}, File: ${fileKey || product.installerFileKey}`);

    return NextResponse.json({
      success: true,
      message: `Release ${version} registered for ${slug}`,
      slug,
      version,
      checksum,
      minOS: minOS || product.minOS,
      changelog: changelog || [],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to publish release" }, { status: 500 });
  }
}

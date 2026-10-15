import { revalidatePath, revalidateTag } from "next/cache";
import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { writeClient } from "@/lib/sanity";
export async function POST(req: Request) {
    const secret = process.env.RELEASE_PUBLISH_SECRET;
    if (!secret || secret.startsWith("change-this") || !process.env.SANITY_API_WRITE_TOKEN || !process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
        return NextResponse.json({ error: "Release publishing is not configured" }, { status: 503 });
    }
    const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
    if (Buffer.byteLength(token) !== Buffer.byteLength(secret) || !timingSafeEqual(Buffer.from(token), Buffer.from(secret))) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    let body;
    try {
        body = await req.json();
    }
    catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    if (!body || typeof body !== "object" || Array.isArray(body)) return NextResponse.json({ error: "Expected a JSON object" }, { status: 400 });
    const { slug, version, checksum, fileKey, changelog, isSigned, malwareScanPassed } = body;
    if (typeof slug !== "string" || !/^[a-z0-9-]+$/.test(slug) || typeof version !== "string" || !/^v?\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?$/.test(version) || typeof checksum !== "string" || !/^[a-f0-9]{64}$/i.test(checksum) || typeof fileKey !== "string" || !fileKey.startsWith(`releases/${slug}/`) || fileKey.includes("..") || fileKey.includes("\\") || isSigned !== true || malwareScanPassed !== true || (changelog !== undefined && typeof changelog !== "string")) {
        return NextResponse.json({ error: "Valid slug, version, SHA-256, private file key, signing and malware scan attestations required" }, { status: 400 });
    }
    try {
        const cms = writeClient();
        const product = await cms.fetch<{
            _id: string;
        } | null>(`*[_type == "product" && slug.current == $slug && !(_id in path("drafts.**"))][0]{_id}`, { slug });
        if (!product)
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        const id = `release.${slug}.${version}`;
        const existing = await cms.getDocument<{
            _id: string;
            sha256Checksum: string;
            installerFileKey: string;
        }>(id);
        if (existing) {
            if (existing.sha256Checksum !== checksum.toLowerCase() || existing.installerFileKey !== fileKey)
                return NextResponse.json({ error: "Version already registered with different artifact" }, { status: 409 });
            return NextResponse.json({ success: true, id, duplicate: true });
        }
        await cms.transaction().create({ _id: id, _type: "release", product: { _type: "reference", _ref: product._id }, version, sha256Checksum: checksum.toLowerCase(), installerFileKey: fileKey, changelog: changelog || "", releaseDate: new Date().toISOString().slice(0, 10), isSigned, malwareScanPassed }).patch(product._id, { set: { currentVersion: version, installerFileKey: fileKey, sha256Checksum: checksum.toLowerCase() } }).commit();
        revalidateTag("content"); revalidatePath("/store"); revalidatePath(`/store/${slug}`); revalidatePath("/");
        return NextResponse.json({ success: true, id, slug, version });
    }
    catch (error) {
        console.error("Release registration failed", error);
        return NextResponse.json({ error: "Release registration failed" }, { status: 500 });
    }
}

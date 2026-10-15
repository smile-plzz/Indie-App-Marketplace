import { NextResponse } from "next/server";
import { commit, readOnlyResponse, studioWritable, slugValue } from "@/lib/admin";
export const runtime = "nodejs";
export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) return NextResponse.json({error:"Invalid origin"},{status:403});
    if (!studioWritable())
        return readOnlyResponse();
    let body: Record<string, unknown>;
    try {
        body = await request.json();
    }
    catch {
        return NextResponse.json({ error: "Invalid product data." }, { status: 400 });
    }
    if (!body || typeof body !== "object" || Array.isArray(body)) return NextResponse.json({ error: "Expected a JSON object." }, { status: 400 });
    for (const key of ["features", "faq"]) {
        if (Array.isArray(body[key]) && (body[key] as unknown[]).some(row => !row || typeof row !== "object" || Array.isArray(row))) return NextResponse.json({ error: "Features and FAQ must contain objects." }, { status: 400 });
    }
    const title = String(body.title || "").trim();
    const slug = slugValue(body.slug);
    if (!title || !slug || !String(body.tagline || "").trim() || !["draft", "published", "archived"].includes(String(body.status)))
        return NextResponse.json({ error: "Title, slug, tagline and valid status are required." }, { status: 400 });
    if (![body.priceBDT, body.priceUSD].every(value => typeof value === "number" && Number.isSafeInteger(value) && value >= 0))
        return NextResponse.json({ error: "Prices must be nonnegative whole amounts in poisha and cents." }, { status: 400 });
    let repo: URL;
    try {
        repo = new URL(String(body.repoUrl));
    }
    catch {
        return NextResponse.json({ error: "Enter a valid GitHub repository URL." }, { status: 400 });
    }
    if (repo.protocol !== "https:" || repo.hostname !== "github.com" || repo.pathname.split("/").filter(Boolean).length < 2)
        return NextResponse.json({ error: "Enter an HTTPS GitHub repository URL." }, { status: 400 });
    const fields: Record<string, unknown> = { title, slug };
    for (const key of ["tagline", "summary", "description", "category", "repoUrl", "license", "minOS"])
        fields[key] = String(body[key] || "");
    fields.priceBDT = body.priceBDT;
    fields.priceUSD = body.priceUSD;
    fields.status = body.status;
    fields.featured = body.featured === true;
    fields.systemRequirements = Array.isArray(body.systemRequirements) ? body.systemRequirements.map(String).slice(0, 30) : [];
    for (const [key, first, second] of [["features", "title", "description"], ["faq", "question", "answer"]])
        fields[key] = Array.isArray(body[key]) ? (body[key] as Record<string, unknown>[]).slice(0, 30).map((row, index) => ({ _key: `row-${index}`, [first]: String(row[first] || ""), [second]: String(row[second] || "") })) : [];
    if (body.shot === null)
        fields.shot = null;
    else if (body.shot && typeof body.shot === "object") {
        const shot = body.shot as Record<string, unknown>;
        if (typeof shot.assetId === "string" && /^image-[a-zA-Z0-9-]+$/.test(shot.assetId))
            fields.shot = { _type: "image", asset: { _type: "reference", _ref: shot.assetId }, alt: String(shot.alt || "") };
    }
    try {
        const result = await commit(async (client) => {
            const duplicate = await client.fetch<string | null>(`*[_type == "product" && slug.current == $slug && _id != $id][0]._id`, { slug: slug.current, id: String(body.id || "") });
            if (duplicate)
                throw new Error("Another product already uses this slug.");
            if (body.id) {
                const existing = await client.getDocument(String(body.id));
                if (!existing || existing._type !== "product")
                    throw new Error("Product not found.");
                const existingSlug = (existing.slug as { current?: string } | undefined)?.current;
                if (existingSlug !== slug.current) {
                    const releaseCount = await client.fetch<number>(`count(*[_type == "release" && product._ref == $id])`, { id: String(body.id) });
                    if (releaseCount > 0) throw new Error("A released product's slug cannot be changed.");
                }
                return client.patch(String(body.id)).set(fields).commit();
            }
            return client.create({ _type: "product", ...fields });
        });
        return NextResponse.json({ id: result._id });
    }
    catch (error) {
        if (error instanceof Error && error.message === "A released product's slug cannot be changed.") return NextResponse.json({ error: error.message }, { status: 409 });
        return NextResponse.json({ error: "Could not save. Check the slug is unique and the content connection is available." }, { status: 400 });
    }
}

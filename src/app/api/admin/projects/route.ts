import { NextResponse } from "next/server";
import { commit, failure, pickFields, readOnlyResponse, slugValue, studioWritable } from "@/lib/admin";
import { adminProjects } from "@/lib/admin-content";

export const runtime = "nodejs";

/** Create  -  a new project starts unpublished so the index does not change. */
export async function POST(request: Request) {
  if (!studioWritable()) return readOnlyResponse();

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const existing = await adminProjects();
    const fields = pickFields("project", body);
    const slug = slugValue(body.slug ?? body.title);

    const doc = await commit((client) =>
      client.create({
        _type: "project",
        ...fields,
        slug,
        order: Number(body.order) || existing.length + 1,
        imageHeight: Number(body.imageHeight) || 200,
        placeholderCopy: true,
        featured: false,
        hidden: true,
      }),
    );

    return NextResponse.json({ id: doc._id });
  } catch (error) {
    return failure(error);
  }
}

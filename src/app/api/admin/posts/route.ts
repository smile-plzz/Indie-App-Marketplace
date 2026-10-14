import { NextResponse } from "next/server";
import { commit, failure, pickFields, readOnlyResponse, slugValue, studioWritable } from "@/lib/admin";

export const runtime = "nodejs";

/** Create  -  new posts land as drafts, so the writing feed stays untouched. */
export async function POST(request: Request) {
  if (!studioWritable()) return readOnlyResponse();

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const fields = pickFields("post", body);

    const doc = await commit((client) =>
      client.create({
        _id: `drafts.${crypto.randomUUID()}`,
        _type: "post",
        kind: "Note",
        date: new Date().toISOString().slice(0, 10),
        ...fields,
        slug: slugValue(body.slug ?? body.title ?? "untitled"),
      }),
    );

    return NextResponse.json({ id: doc._id });
  } catch (error) {
    return failure(error);
  }
}

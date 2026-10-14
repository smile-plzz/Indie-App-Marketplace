import { NextResponse } from "next/server";
import { commit, failure, pickFields, readOnlyResponse, slugValue, studioWritable } from "@/lib/admin";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  if (!studioWritable()) return readOnlyResponse();
  const { id } = await params;

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const fields = pickFields("post", body);
    if ("slug" in fields) fields.slug = slugValue(fields.slug);
    if ("readingMinutes" in fields) {
      fields.readingMinutes = Number(fields.readingMinutes) || null;
    }

    // "Publish" is the draft losing its prefix; the public query filters on it.
    if (body.publish === true && id.startsWith("drafts.")) {
      const publishedId = id.replace(/^drafts\./, "");
      await commit(async (client) => {
        const draft = await client.getDocument(id);
        await client
          .transaction()
          .createOrReplace({
            ...(draft as Record<string, unknown>),
            ...fields,
            _id: publishedId,
            _type: "post",
          })
          .delete(id)
          .commit();
      });
      return NextResponse.json({ ok: true, id: publishedId });
    }

    await commit((client) => client.patch(id).set(fields).commit());
    return NextResponse.json({ ok: true, id });
  } catch (error) {
    return failure(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  if (!studioWritable()) return readOnlyResponse();
  const { id } = await params;

  try {
    await commit((client) => client.delete(id));
    return NextResponse.json({ ok: true });
  } catch (error) {
    return failure(error);
  }
}

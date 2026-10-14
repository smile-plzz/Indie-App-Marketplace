import { NextResponse } from "next/server";
import { commit, failure, pickFields, readOnlyResponse, slugValue, studioWritable } from "@/lib/admin";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  if (!studioWritable()) return readOnlyResponse();
  const { id } = await params;

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const fields = pickFields("project", body);
    if ("slug" in fields) fields.slug = slugValue(fields.slug);
    if ("order" in fields) fields.order = Number(fields.order) || 0;
    if ("imageHeight" in fields) fields.imageHeight = Number(fields.imageHeight) || 200;

    await commit((client) => client.patch(id).set(fields).commit());
    return NextResponse.json({ ok: true });
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

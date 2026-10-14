import { NextResponse } from "next/server";
import { commit, failure, readOnlyResponse, studioWritable } from "@/lib/admin";

export const runtime = "nodejs";

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED = ["image/png", "image/jpeg", "image/webp", "image/avif"];

export async function POST(request: Request) {
  if (!studioWritable()) return readOnlyResponse();

  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file received." }, { status: 400 });
    }
    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json(
        { error: "Screenshots must be PNG, JPEG, WebP or AVIF." },
        { status: 415 },
      );
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "That file is over 8 MB. Export it smaller." },
        { status: 413 },
      );
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const asset = await commit((client) =>
      client.assets.upload("image", bytes, {
        filename: file.name,
        contentType: file.type,
      }),
    );

    return NextResponse.json({
      id: asset._id,
      url: asset.url,
      filename: asset.originalFilename,
    });
  } catch (error) {
    return failure(error);
  }
}

export async function DELETE(request: Request) {
  if (!studioWritable()) return readOnlyResponse();

  try {
    const { id } = (await request.json()) as { id?: string };
    if (!id) return NextResponse.json({ error: "No asset id." }, { status: 400 });
    await commit((client) => client.delete(id));
    return NextResponse.json({ ok: true });
  } catch (error) {
    return failure(error);
  }
}

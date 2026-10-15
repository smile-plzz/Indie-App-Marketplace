import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { studioWritable, readOnlyResponse } from "@/lib/admin";
import { writeClient } from "@/lib/sanity";
import { importPreparedContent } from "@/lib/marketplace/import-content";

export async function POST(req: Request) {
  if (req.headers.get("origin") !== new URL(req.url).origin) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  if (!studioWritable()) return readOnlyResponse();
  try {
    const result = await importPreparedContent(writeClient());
    revalidateTag("content");
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("Content import failed", error);
    return NextResponse.json({ error: "Import failed. Check the Sanity connection. Existing records were not replaced." }, { status: 502 });
  }
}

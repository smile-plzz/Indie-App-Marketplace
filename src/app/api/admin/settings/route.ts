import { NextResponse } from "next/server";
import { commit, failure, pickFields, readOnlyResponse, studioWritable } from "@/lib/admin";

export const runtime = "nodejs";

export async function PATCH(request: Request) {
  if (!studioWritable()) return readOnlyResponse();

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const fields = pickFields("siteSettings", body);

    await commit((client) =>
      client
        .patch("siteSettings")
        .setIfMissing({ _type: "siteSettings" })
        .set(fields)
        .commit(),
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    return failure(error);
  }
}

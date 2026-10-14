import { NextResponse } from "next/server";
import { verifyAndConsumeDownload } from "@/lib/marketplace/delivery";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const result = await verifyAndConsumeDownload(token);

    if (!result.valid) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
      const errorMsg = encodeURIComponent(result.error || "Invalid download link");
      return NextResponse.redirect(`${siteUrl}/store/download-error?error=${errorMsg}`);
    }

    // Redirect to the time-limited signed URL
    return NextResponse.redirect(new URL(result.signedUrl!, req.url));
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Download error" }, { status: 500 });
  }
}

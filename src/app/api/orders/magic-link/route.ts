import { rateLimited } from "@/lib/marketplace/rate-limit";
import { NextResponse } from "next/server";
import { generateMagicLinkToken } from "@/lib/marketplace/delivery";
import { getEmailService } from "@/lib/marketplace/email";
import { getOrdersByEmail } from "@/lib/marketplace/db";
export async function POST(req: Request) {
    try {
        if (await rateLimited(req, "magic-link", 5, 300))
            return NextResponse.json({ error: "Please wait before requesting another link" }, { status: 429 });
        const body = await req.json();
        const { email } = body;
        if (!email || typeof email !== "string" || !email.includes("@")) {
            return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
        }
        const cleanEmail = email.toLowerCase().trim();
        const orders = await getOrdersByEmail(cleanEmail);
        // If customer has orders, send magic link
        if (orders.length > 0) {
            const token = generateMagicLinkToken(cleanEmail, 60);
            const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
            const magicUrl = `${siteUrl}/store/orders?token=${encodeURIComponent(token)}`;
            const emailService = getEmailService();
            await emailService.sendMagicLink(cleanEmail, magicUrl);
        }
        // Always return success to protect privacy and prevent email enumeration
        return NextResponse.json({
            success: true,
            message: "If you have orders under this email, an access link has been sent.",
        });
    }
    catch (err: any) {
        return NextResponse.json({ error: err?.message || "Failed to process request" }, { status: 500 });
    }
}

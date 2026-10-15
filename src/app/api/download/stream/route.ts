import { NextResponse } from "next/server";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { localReleasePath } from "@/lib/marketplace/delivery";
import { downloadSecret, safeEqual } from "@/lib/marketplace/security";
export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const key = url.searchParams.get("key");
        const expires = url.searchParams.get("expires");
        const sig = url.searchParams.get("sig");
        if (!key || !expires || !sig) {
            return NextResponse.json({ error: "Missing download parameters" }, { status: 400 });
        }
        const expiresAt = parseInt(expires, 10);
        const now = Math.floor(Date.now() / 1000);
        if (isNaN(expiresAt) || now > expiresAt) {
            return NextResponse.json({ error: "Download link has expired" }, { status: 403 });
        }
        const secret = downloadSecret();
        const dataToSign = `${key}:${expires}`;
        const expectedSig = crypto.createHmac("sha256", secret).update(dataToSign).digest("hex");
        if (!safeEqual(sig, expectedSig)) {
            return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
        }
        const filename = path.basename(key) || "installer.exe";
        let filePath: string;
        try {
            filePath = localReleasePath(key);
        }
        catch {
            return NextResponse.json({ error: "Release file unavailable" }, { status: 404 });
        }
        if (fs.existsSync(filePath)) {
            const fileBuffer = fs.readFileSync(filePath);
            return new NextResponse(fileBuffer, {
                headers: {
                    "Content-Type": "application/octet-stream",
                    "Content-Disposition": `attachment; filename="${filename}"`,
                    "Content-Length": fileBuffer.length.toString(),
                },
            });
        }
        return NextResponse.json({ error: "Release file unavailable" }, { status: 404 });
    }
    catch (err: any) {
        return NextResponse.json({ error: err?.message || "Stream error" }, { status: 500 });
    }
}

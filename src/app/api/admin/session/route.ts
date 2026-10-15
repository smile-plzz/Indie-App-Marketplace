import { adminLoginLimited } from "@/lib/marketplace/admin-login-limit";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, adminConfigured, createSession } from "@/lib/auth";
export const runtime = "nodejs";
export async function POST(request: Request) {
    if (!adminConfigured()) {
        return NextResponse.json({ error: "Studio is closed  -  ADMIN_PASSWORD is not set." }, { status: 503 });
    }
    try {
        if (await adminLoginLimited(request))
            return NextResponse.json({ error: "Too many attempts. Try again in five minutes." }, { status: 429 });
    } catch {
        return NextResponse.json({ error: "Login protection is unavailable. Check the Sanity or database connection." }, { status: 503 });
    }
    const body = (await request.json().catch(() => null)) as {
        password?: string;
    } | null;
    const session = await createSession(body?.password ?? "");
    if (!session) {
        return NextResponse.json({ error: "That password is wrong." }, { status: 401 });
    }
    const response = NextResponse.json({ ok: true });
    response.cookies.set(SESSION_COOKIE, session.value, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: session.maxAge,
    });
    return response;
}
export async function DELETE() {
    const response = NextResponse.json({ ok: true });
    response.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
    return response;
}

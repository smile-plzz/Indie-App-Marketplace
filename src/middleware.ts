import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/auth";

/**
 * Everything under /admin needs a session. The login page and its endpoint are
 * the only exceptions, or there would be no way in.
 */
export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // The login page and the endpoint that issues the session are the way in;
  // guarding them would lock the studio for good.
  if (pathname === "/admin/login" || pathname === "/api/admin/session") {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (await verifySession(token)) return NextResponse.next();

  if (pathname.startsWith("/api/admin")) {
    return NextResponse.json({ error: "Not authorised" }, { status: 401 });
  }

  const url = request.nextUrl.clone();
  url.pathname = "/admin/login";
  url.search = pathname === "/admin" ? "" : `?next=${encodeURIComponent(pathname + search)}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};

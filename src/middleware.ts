import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Lightweight middleware for /admin routes.
 * Only checks that a session cookie exists (fast, Edge-compatible).
 * The real role-based authorization happens server-side in
 * src/app/admin/layout.tsx (Prisma query for user.role === "admin").
 */
export function middleware(req: NextRequest) {
  const sessionCookie =
    req.cookies.get("authjs.session-token") ??
    req.cookies.get("__Secure-authjs.session-token");

  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};

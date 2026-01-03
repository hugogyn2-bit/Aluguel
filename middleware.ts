import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  const isAuth = !!token;
  const role = token?.role as "TENANT" | "OWNER" | undefined;
  const ownerPaid = !!token?.ownerPaid;

  // protect tenant
  if (pathname.startsWith("/tenant")) {
    if (!isAuth) return NextResponse.redirect(new URL(`/auth/sign-in?role=TENANT`, req.url));
  }

  // protect owner
  if (pathname.startsWith("/owner")) {
    if (!isAuth) return NextResponse.redirect(new URL(`/auth/sign-in?role=OWNER`, req.url));
    if (role !== "OWNER") return NextResponse.redirect(new URL(`/tenant`, req.url));
    if (!ownerPaid) return NextResponse.redirect(new URL(`/paywall`, req.url));
  }

  // paywall requires owner session
  if (pathname.startsWith("/paywall")) {
    if (!isAuth) return NextResponse.redirect(new URL(`/auth/sign-in?role=OWNER`, req.url));
    if (role !== "OWNER") return NextResponse.redirect(new URL(`/tenant`, req.url));
  }

  // Auth pages: keep role param for UX
  if (pathname === "/auth/sign-in" || pathname === "/auth/sign-up") {
    const r = searchParams.get("role");
    if (!r) {
      // default
      const u = new URL(req.url);
      u.searchParams.set("role", "TENANT");
      return NextResponse.redirect(u);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/tenant/:path*", "/owner/:path*", "/paywall", "/auth/sign-in", "/auth/sign-up"],
};

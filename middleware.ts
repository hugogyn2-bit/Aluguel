import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const isAuth = !!token;
  const role = token?.role as "TENANT" | "OWNER" | undefined;

  const ownerPaid = !!token?.ownerPaid;
  const trialEndsAtRaw = token?.trialEndsAt as string | undefined;
  const trialEndsAt = trialEndsAtRaw ? new Date(trialEndsAtRaw) : null;
  const inTrial = trialEndsAt ? Date.now() < trialEndsAt.getTime() : false;

  // Protege tenant
  if (pathname.startsWith("/tenant")) {
    if (!isAuth) return NextResponse.redirect(new URL("/auth/sign-in", req.url));
    if (role !== "TENANT") return NextResponse.redirect(new URL("/owner", req.url));
  }

  // Protege owner
  if (pathname.startsWith("/owner")) {
    if (!isAuth) return NextResponse.redirect(new URL("/auth/sign-in", req.url));
    if (role !== "OWNER") return NextResponse.redirect(new URL("/tenant", req.url));

    // ✅ libera se pagou OU está no trial
    if (!ownerPaid && !inTrial) return NextResponse.redirect(new URL("/paywall", req.url));
  }

  // Paywall exige owner logado
  if (pathname.startsWith("/paywall")) {
    if (!isAuth) return NextResponse.redirect(new URL("/auth/sign-in", req.url));
    if (role !== "OWNER") return NextResponse.redirect(new URL("/tenant", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/tenant/:path*", "/owner/:path*", "/paywall"],
};

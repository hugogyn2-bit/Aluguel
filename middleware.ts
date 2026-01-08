import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

function redirectTo(path: string, req: NextRequest) {
  return NextResponse.redirect(new URL(path, req.url));
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const isAuth = !!token;
  const role = token?.role as "TENANT" | "OWNER" | undefined;

  const trialEndsAt = token?.trialEndsAt ? new Date(String(token.trialEndsAt)) : null;
  const inTrial = trialEndsAt ? Date.now() < trialEndsAt.getTime() : false;
  const ownerPaid = !!token?.ownerPaid;

  if (pathname.startsWith("/owner")) {
    if (!isAuth) return redirectTo("/auth/sign-in", req);
    if (role !== "OWNER") return redirectTo("/tenant", req);
    if (!ownerPaid && !inTrial) return redirectTo("/paywall", req);
  }

  if (pathname.startsWith("/tenant")) {
    if (!isAuth) return redirectTo("/auth/sign-in", req);
    if (role !== "TENANT") return redirectTo("/owner", req);
  }

  if (pathname.startsWith("/paywall")) {
    if (!isAuth) return redirectTo("/auth/sign-in", req);
    if (role !== "OWNER") return redirectTo("/tenant", req);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/owner/:path*", "/tenant/:path*", "/paywall/:path*"],
};

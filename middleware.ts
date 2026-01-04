import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

type Role = "TENANT" | "OWNER";

function normalizeRole(v: string | null): Role {
  return v?.toUpperCase() === "OWNER" ? "OWNER" : "TENANT";
}

export async function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  // ✅ Compat: rotas antigas
  if (pathname === "/login") {
    const r = normalizeRole(searchParams.get("role"));
    return NextResponse.redirect(new URL(`/auth/sign-in?role=${r}`, req.url));
  }

  if (pathname === "/register") {
    const r = normalizeRole(searchParams.get("role"));
    return NextResponse.redirect(new URL(`/auth/sign-up?role=${r}`, req.url));
  }

  // ✅ Lê sessão/token (JWT)
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  const isAuth = !!token;
  const role = (token?.role as Role | undefined) ?? undefined;
  const ownerPaid = Boolean((token as any)?.ownerPaid);

  // ✅ Auth pages: garante role param (UX)
  if (pathname === "/auth/sign-in" || pathname === "/auth/sign-up") {
    const r = searchParams.get("role");
    if (!r) {
      const u = new URL(req.url);
      u.searchParams.set("role", "TENANT");
      return NextResponse.redirect(u);
    }
  }

  // ✅ Protect tenant
  if (pathname.startsWith("/tenant")) {
    if (!isAuth) return NextResponse.redirect(new URL(`/auth/sign-in?role=TENANT`, req.url));
  }

  // ✅ Protect owner + trial/paywall
  if (pathname.startsWith("/owner")) {
    if (!isAuth) return NextResponse.redirect(new URL(`/auth/sign-in?role=OWNER`, req.url));
    if (role !== "OWNER") return NextResponse.redirect(new URL(`/tenant`, req.url));

    // trialEndsAt vem do token como string ISO (ou null)
    const rawTrial = (token as any)?.trialEndsAt as string | null | undefined;

    const trialEndsAt = rawTrial ? new Date(rawTrial) : null;
    const inTrial =
      trialEndsAt && !Number.isNaN(trialEndsAt.getTime())
        ? Date.now() < trialEndsAt.getTime()
        : false;

    if (!ownerPaid && !inTrial) {
      return NextResponse.redirect(new URL(`/paywall`, req.url));
    }
  }

  // ✅ Paywall requires owner session
  if (pathname.startsWith("/paywall")) {
    if (!isAuth) return NextResponse.redirect(new URL(`/auth/sign-in?role=OWNER`, req.url));
    if (role !== "OWNER") return NextResponse.redirect(new URL(`/tenant`, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/tenant/:path*",
    "/owner/:path*",
    "/paywall",
    "/auth/sign-in",
    "/auth/sign-up",
    "/login",
    "/register",
  ],
};

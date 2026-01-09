// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

function redirectTo(path: string, req: NextRequest) {
  return NextResponse.redirect(new URL(path, req.url));
}

export async function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  // ✅ Compat rotas antigas
  if (pathname === "/login") {
    return redirectTo(`/auth/sign-in`, req);
  }

  if (pathname === "/register") {
    return redirectTo(`/auth/sign-up`, req);
  }

  // ✅ Token (JWT)
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  const isAuth = !!token;
  const role = token?.role as "TENANT" | "OWNER" | undefined;

  // trialEndsAt vem como string ISO (do JWT)
  const trialEndsAt = token?.trialEndsAt ? new Date(String(token.trialEndsAt)) : null;
  const inTrial = !!trialEndsAt && Date.now() < trialEndsAt.getTime();

  const ownerPaid = !!token?.ownerPaid;

  // ✅ Auth pages sempre liberadas
  if (pathname.startsWith("/auth")) return NextResponse.next();

  // ✅ Paywall: requer OWNER logado
  // (IMPORTANTE: não pode redirecionar /paywall pra /paywall, senão loop)
  if (pathname.startsWith("/paywall")) {
    if (!isAuth) return redirectTo(`/auth/sign-in`, req);
    if (role !== "OWNER") return redirectTo(`/tenant`, req);
    return NextResponse.next();
  }

  // ✅ Protect tenant
  if (pathname.startsWith("/tenant")) {
    if (!isAuth) return redirectTo(`/auth/sign-in`, req);
    if (role !== "TENANT") return redirectTo(`/owner`, req);
    return NextResponse.next();
  }

  // ✅ Protect owner (inclui /owner/tenants)
  if (pathname.startsWith("/owner")) {
    if (!isAuth) return redirectTo(`/auth/sign-in`, req);
    if (role !== "OWNER") return redirectTo(`/tenant`, req);

    // ✅ dono só passa se pagou OU está no trial
    if (!ownerPaid && !inTrial) return redirectTo(`/paywall`, req);

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/tenant/:path*",
    "/owner/:path*",
    "/paywall/:path*",
    "/auth/sign-in",
    "/auth/sign-up",
    "/login",
    "/register",
  ],
};

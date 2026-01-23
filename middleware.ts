import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // ✅ liberar estáticos e rotas públicas
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/auth") ||
    pathname === "/"
  ) {
    return NextResponse.next();
  }

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // ✅ se não logou e tentou acessar tenant/owner -> manda pro login
  if (!token && (pathname.startsWith("/owner") || pathname.startsWith("/tenant"))) {
    return NextResponse.redirect(new URL("/auth/sign-in", req.url));
  }

  // ✅ BLOQUEIA TENANT ENTRAR NO OWNER
  if (pathname.startsWith("/owner")) {
    if (!token) {
      return NextResponse.redirect(new URL("/auth/sign-in", req.url));
    }

    const role = (token as any)?.role;

    if (role !== "OWNER") {
      // TENANT tentando acessar /owner -> manda pra área tenant
      return NextResponse.redirect(new URL("/tenant", req.url));
    }

    return NextResponse.next();
  }

  // ✅ BLOQUEIA OWNER ENTRAR NO TENANT
  if (pathname.startsWith("/tenant")) {
    if (!token) {
      return NextResponse.redirect(new URL("/auth/sign-in", req.url));
    }

    const role = (token as any)?.role;

    if (role !== "TENANT") {
      // OWNER tentando acessar /tenant -> manda pra área owner
      return NextResponse.redirect(new URL("/owner", req.url));
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/owner/:path*", "/tenant/:path*"],
};

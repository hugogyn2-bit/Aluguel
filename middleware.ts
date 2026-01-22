import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // ✅ libera arquivos estáticos e rotas públicas
  const publicPaths = [
    "/",
    "/favicon.ico",
    "/robots.txt",
    "/sitemap.xml",
  ];

  const isPublic =
    publicPaths.includes(pathname) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/auth");

  if (isPublic) {
    return NextResponse.next();
  }

  // ✅ tudo que for /owner precisa estar logado
  if (pathname.startsWith("/owner")) {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      return NextResponse.redirect(new URL("/auth/sign-in", req.url));
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/owner/:path*"],
};

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const PUBLIC_PATHS = [
  "/auth/sign-in",
  "/auth/sign-up",
  "/auth/forgot-password",
  "/auth/reset-password",
];

const PUBLIC_API_PATHS = [
  "/api/auth/sign-up",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
  "/api/auth/[...nextauth]",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ✅ libera arquivos estáticos
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/assets")
  ) {
    return NextResponse.next();
  }

  // ✅ libera páginas públicas
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // ✅ libera APIs públicas
  if (PUBLIC_API_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // ❌ não autenticado → login
  if (!token) {
    return NextResponse.redirect(new URL("/auth/sign-in", req.url));
  }

  // 🔐 controle por role
  if (pathname.startsWith("/owner") && token.role !== "OWNER") {
    return NextResponse.redirect(new URL("/tenant", req.url));
  }

  if (pathname.startsWith("/tenant") && token.role !== "TENANT") {
    return NextResponse.redirect(new URL("/owner", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

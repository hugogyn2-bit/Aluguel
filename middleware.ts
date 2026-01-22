import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // ✅ libera arquivos estáticos e rotas públicas
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

  // ✅ qualquer área protegida precisa de login
  if (!token) {
    return NextResponse.redirect(new URL("/auth/sign-in", req.url));
  }

  // ✅ protege tudo de /owner (somente OWNER)
  if (pathname.startsWith("/owner")) {
    if (token.role !== "OWNER") {
      // TENANT ou outro -> manda pro painel do tenant
      return NextResponse.redirect(new URL("/tenant", req.url));
    }
    return NextResponse.next();
  }

  // ✅ protege tudo de /tenant (somente TENANT)
  if (pathname.startsWith("/tenant")) {
    if (token.role !== "TENANT") {
      return NextResponse.redirect(new URL("/owner", req.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/owner/:path*", "/tenant/:path*"],
};

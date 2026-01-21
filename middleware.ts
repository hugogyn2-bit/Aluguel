import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // ✅ rotas que exigem login (e OWNER)
  const protectedOwnerRoutes = [
    "/owner/tenants/create",
    "/owner/tenants",
    "/owner/dashboard",
    "/owner/settings",
  ];

  const isProtected = protectedOwnerRoutes.some((p) => pathname.startsWith(p));

  if (!isProtected) return NextResponse.next();

  // ✅ pega token do NextAuth (EDGE safe)
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // ✅ não logou
  if (!token?.email) {
    return NextResponse.redirect(new URL("/auth/sign-in", req.url));
  }

  // ✅ aqui você pode validar role se ela estiver no token
  // (só funciona se você colocar "role" no token no NextAuth callbacks)
  const role = (token as any)?.role;

  if (role && role !== "OWNER") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // ✅ Paywall NÃO FAZEMOS no middleware pq não dá pra consultar DB aqui
  // O paywall você controla nas rotas /api ou pages server-side.

  return NextResponse.next();
}

export const config = {
  matcher: ["/owner/:path*"],
};

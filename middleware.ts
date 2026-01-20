import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // ✅ aqui você coloca as rotas que quer proteger pelo paywall
  const protectedOwnerRoutes = [
    "/owner/tenants/create",
    "/owner/tenants",
    "/owner/dashboard",
  ];

  const isProtected = protectedOwnerRoutes.some((p) => pathname.startsWith(p));

  if (!isProtected) return NextResponse.next();

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token?.sub) {
    return NextResponse.redirect(new URL("/auth/sign-in", req.url));
  }

  const user = await prisma.user.findUnique({
    where: { id: token.sub },
  });

  if (!user) {
    return NextResponse.redirect(new URL("/auth/sign-in", req.url));
  }

  if (user.role !== "OWNER") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const now = new Date();

  const hasPremium =
    user.stripeStatus === "active" ||
    user.stripeStatus === "trialing" ||
    (user.trialEndsAt && user.trialEndsAt > now);

  if (!hasPremium) {
    return NextResponse.redirect(new URL("/owner/premium?blocked=1", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/owner/:path*"],
};

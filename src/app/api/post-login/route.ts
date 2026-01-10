import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.redirect(new URL("/auth/sign-in", req.url));

  if (token.role === "OWNER") return NextResponse.redirect(new URL("/paywall", req.url));

  // ✅ Se for TENANT e ainda precisa trocar senha, envia pra tela correta
  if ((token as any).mustChangePassword) return NextResponse.redirect(new URL("/tenant/change-password", req.url));

  return NextResponse.redirect(new URL("/tenant", req.url));
}

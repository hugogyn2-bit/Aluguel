import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    if (token.role !== "TENANT") return NextResponse.json({ error: "Apenas inquilino" }, { status: 403 });

    const body = await req.json().catch(() => null) as any;
    const newPassword = String(body?.newPassword ?? "");
    if (newPassword.length < 6) return NextResponse.json({ error: "Senha mínima 6 caracteres." }, { status: 400 });

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: String(token.id) }, data: { passwordHash } });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

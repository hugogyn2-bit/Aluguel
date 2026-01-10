import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET });

  if (!token) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (token.role !== "TENANT") return NextResponse.json({ error: "Somente TENANT" }, { status: 403 });

  const body = await req.json().catch(() => null) as any;
  const password = String(body?.password ?? "");

  if (password.length < 6) {
    return NextResponse.json({ error: "Senha deve ter pelo menos 6 caracteres." }, { status: 400 });
  }

  const userId = String((token as any).id ?? (token as any).uid ?? "");
  if (!userId) return NextResponse.json({ error: "Sessão inválida" }, { status: 400 });

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash, mustChangePassword: false },
  });

  return NextResponse.json({ ok: true });
}

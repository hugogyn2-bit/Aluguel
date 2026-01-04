import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

export const runtime = "nodejs";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET });

    if (!token) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    if (token.role !== "OWNER") return NextResponse.json({ error: "Somente OWNER" }, { status: 403 });

    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });

    const ownerId = String(token.id);
    const { email, password, name } = parsed.data;

    const emailNorm = email.trim().toLowerCase();

    const exists = await prisma.user.findUnique({ where: { email: emailNorm } });
    if (exists) return NextResponse.json({ error: "E-mail já cadastrado" }, { status: 409 });

    const passwordHash = await bcrypt.hash(password, 10);

    const tenant = await prisma.user.create({
      data: {
        email: emailNorm,
        name,
        passwordHash,
        role: "TENANT",
        ownerId,
      },
      select: { id: true, email: true, name: true, createdAt: true },
    });

    return NextResponse.json({ ok: true, tenant });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

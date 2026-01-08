// src/app/api/owner/tenants/create/route.ts
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

export const runtime = "nodejs";

const bodySchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(3),
  cpf: z.string().min(5),
  rg: z.string().min(3),
  address: z.string().min(5),
  cep: z.string().min(5),
});

function makeTempPassword(len = 10) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@#$";
  let out = "";
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export async function POST(req: Request) {
  try {
    const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    if (token.role !== "OWNER") return NextResponse.json({ error: "Somente OWNER" }, { status: 403 });

    const ownerId = String((token as any).id);

    const json = await req.json().catch(() => null);
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    const { email, fullName, cpf, rg, address, cep } = parsed.data;

    const existsEmail = await prisma.user.findUnique({ where: { email } });
    if (existsEmail) return NextResponse.json({ error: "E-mail já cadastrado" }, { status: 409 });

    const existsCpf = await prisma.tenantProfile.findUnique({ where: { cpf } });
    if (existsCpf) return NextResponse.json({ error: "CPF já cadastrado" }, { status: 409 });

    const tempPassword = makeTempPassword(10);
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const created = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          name: fullName,
          passwordHash,
          role: "TENANT",
          ownerPaid: false,
          trialEndsAt: null,
        },
      });

      const profile = await tx.tenantProfile.create({
        data: {
          userId: user.id,
          ownerId,
          fullName,
          cpf,
          rg,
          address,
          cep,
        },
      });

      return { user, profile };
    });

    return NextResponse.json({
      ok: true,
      tenantUserId: created.user.id,
      tenantEmail: created.user.email,
      tempPassword,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

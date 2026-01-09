import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

export const runtime = "nodejs";

const bodySchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(3),
  cpf: z.string().length(11),
  rg: z.string().min(3),
  address: z.string().min(5),
  cep: z.string().min(8),
});

function normalizeDigits(s: string) {
  return String(s || "").replace(/\D/g, "");
}

function makeTempPassword(length = 10) {
  // simples e suficiente p/ senha temporária
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@#!";
  let out = "";
  for (let i = 0; i < length; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export async function POST(req: Request) {
  try {
    const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET });

    if (!token) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    if (token.role !== "OWNER") return NextResponse.json({ error: "Somente OWNER" }, { status: 403 });

    // ✅ regra: owner passa se pagou OU está no trial
    const ownerPaid = !!token.ownerPaid;
    const trialEndsAt = token.trialEndsAt ? new Date(String(token.trialEndsAt)) : null;
    const inTrial = !!trialEndsAt && Date.now() < trialEndsAt.getTime();
    if (!ownerPaid && !inTrial) {
      return NextResponse.json({ error: "Sem acesso (paywall)" }, { status: 402 });
    }

    const body = await req.json().catch(() => null);
    const parsed = bodySchema.safeParse({
      ...body,
      cpf: normalizeDigits(body?.cpf),
      cep: normalizeDigits(body?.cep),
    });

    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos", details: parsed.error.flatten() }, { status: 400 });
    }

    const ownerId = String(token.id);
    const { email, fullName, cpf, rg, address, cep } = parsed.data;

    // valida duplicidade
    const existsEmail = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existsEmail) return NextResponse.json({ error: "E-mail já cadastrado" }, { status: 409 });

    const existsCpf = await prisma.tenantProfile.findFirst({ where: { cpf } });
    if (existsCpf) return NextResponse.json({ error: "CPF já cadastrado" }, { status: 409 });

    const tempPassword = cpf;
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    // cria tudo em transação
    const created = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: email.toLowerCase(),
          name: fullName,
          passwordHash,
          role: "TENANT",
        },
        select: { id: true, email: true },
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
        select: { id: true },
      });

      return { user, profile };
    });

    return NextResponse.json({
      ok: true,
      tenantUserId: created.user.id,
      tenantEmail: created.user.email,
      tempPassword, // ✅ devolve a senha temporária pro OWNER copiar
    });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

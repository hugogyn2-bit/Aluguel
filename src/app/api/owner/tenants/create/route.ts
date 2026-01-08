import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function onlyDigits(s: string) {
  return s.replace(/\D/g, "");
}

export async function POST(req: Request) {
  try {
    const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    if (token.role !== "OWNER") return NextResponse.json({ error: "Apenas proprietário" }, { status: 403 });

    const body = await req.json().catch(() => null) as any;
    if (!body) return NextResponse.json({ error: "JSON inválido" }, { status: 400 });

    const ownerId = String(token.id);
    const email = String(body.email ?? "").trim().toLowerCase();
    const fullName = String(body.fullName ?? "").trim();
    const cpf = onlyDigits(String(body.cpf ?? ""));
    const rg = String(body.rg ?? "").trim();
    const address = String(body.address ?? "").trim();
    const cep = onlyDigits(String(body.cep ?? "")).slice(0, 8); // CEP 8 dígitos

    if (!email || !fullName || cpf.length !== 11 || !rg || !address || !cep) {
      return NextResponse.json({ error: "Preencha todos os campos. CPF deve ter 11 números." }, { status: 400 });
    }

    const existsEmail = await prisma.user.findUnique({ where: { email } });
    if (existsEmail) return NextResponse.json({ error: "E-mail já cadastrado" }, { status: 409 });

    const existsCpf = await prisma.tenantProfile.findUnique({ where: { cpf } }).catch(() => null);
    if (existsCpf) return NextResponse.json({ error: "CPF já cadastrado" }, { status: 409 });

    // senha padrão = CPF
    const tempPassword = cpf;
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const user = await prisma.user.create({
      data: {
        email,
        name: fullName,
        passwordHash,
        role: "TENANT",
      },
    });

    const tenant = await prisma.tenantProfile.create({
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

    return NextResponse.json({
      ok: true,
      tenant: {
        id: tenant.id,
        email: user.email,
        fullName: tenant.fullName,
        cpf: tenant.cpf,
        rg: tenant.rg,
        address: tenant.address,
        cep: tenant.cep,
        createdAt: tenant.createdAt,
      },
      tempPassword, // para o owner copiar e enviar
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

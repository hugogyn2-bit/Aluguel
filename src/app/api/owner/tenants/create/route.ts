import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const owner = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!owner || owner.role !== "OWNER") {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  // ✅ PAYWALL CHECK
  const now = new Date();
  const hasTrial = owner.trialEndsAt && owner.trialEndsAt > now;
  const allowed = owner.ownerPaid || Boolean(hasTrial);

  if (!allowed) {
    return NextResponse.json(
      { error: "❌ Sem acesso (paywall). Ative o Trial ou vire Premium." },
      { status: 403 }
    );
  }

  // ✅ BODY
  const body = await req.json();

  const fullName = String(body.fullName || "").trim();
  const email = String(body.email || "").toLowerCase().trim();
  const cpf = String(body.cpf || "").trim();
  const rg = String(body.rg || "").trim();
  const address = String(body.address || "").trim();
  const cep = String(body.cep || "").trim();

  if (!fullName || !email || !cpf || !rg || !address || !cep) {
    return NextResponse.json(
      { error: "Preencha todos os campos do inquilino." },
      { status: 400 }
    );
  }

  // ✅ senha provisória (TENANT)
  const tempPassword = "123456";
  const passwordHash = await bcrypt.hash(tempPassword, 10);

  // ✅ evita duplicar tenant pelo email
  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    return NextResponse.json(
      { error: "Já existe um usuário com esse e-mail." },
      { status: 400 }
    );
  }

  // ✅ CRIA TENANT + PROFILE
  const created = await prisma.user.create({
    data: {
      email,
      passwordHash,
      role: "TENANT",
      mustChangePassword: true,
      tenantProfile: {
        create: {
          fullName,
          cpf,
          rg,
          address,
          cep,
          ownerId: owner.id,
        },
      },
    },
    include: {
      tenantProfile: true,
    },
  });

  return NextResponse.json({
    ok: true,
    message: "✅ Inquilino criado com sucesso!",
    tenantUserId: created.id,
    tempPassword,
  });
}

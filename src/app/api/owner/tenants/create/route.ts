import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const owner = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!owner) {
      return NextResponse.json({ error: "Owner não encontrado" }, { status: 404 });
    }

    if (owner.role !== "OWNER") {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    const now = new Date();
    const hasPremium =
      owner.ownerPaid ||
      (owner.trialEndsAt && owner.trialEndsAt > now) ||
      owner.stripeStatus === "active" ||
      owner.stripeStatus === "trialing";

    if (!hasPremium) {
      return NextResponse.json(
        { error: "❌ Sem acesso. Ative Trial ou vire Premium." },
        { status: 403 }
      );
    }

    const body = await req.json();

    const fullName = String(body.fullName || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const address = String(body.address || "").trim();
    const cep = String(body.cep || "").trim();
    const cpf = String(body.cpf || "").trim();
    const rg = String(body.rg || "").trim();
    const phone = String(body.phone || "").trim(); // ✅ NOVO

    if (!fullName || !email || !address || !cep || !cpf || !rg || !phone) {
      return NextResponse.json(
        { error: "Preencha todos os campos." },
        { status: 400 }
      );
    }

    // ✅ senha padrão do tenant
    const defaultPassword = "123456";
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    // ✅ cria o usuário TENANT + perfil do tenant
    const created = await prisma.user.create({
      data: {
        email,
        name: fullName,
        passwordHash,
        role: "TENANT",
        mustChangePassword: true,

        tenantProfile: {
          create: {
            ownerId: owner.id,
            fullName,
            cpf,
            rg,
            phone, // ✅ NOVO
            address,
            cep,
          },
        },
      },
      include: {
        tenantProfile: true,
      },
    });

    return NextResponse.json({
      message: "✅ Inquilino criado com sucesso!",
      tenant: {
        id: created.id,
        email: created.email,
        name: created.name,
        mustChangePassword: created.mustChangePassword,
        tenantProfile: created.tenantProfile,
      },
      defaultPassword: "123456",
    });
  } catch (err: any) {
    console.error("❌ Erro ao criar tenant:", err?.message || err);

    return NextResponse.json(
      { error: "Erro interno ao criar inquilino" },
      { status: 500 }
    );
  }
}

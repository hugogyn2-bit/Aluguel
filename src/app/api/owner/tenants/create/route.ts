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
      return NextResponse.json({ error: "OWNER não encontrado" }, { status: 404 });
    }

    if (owner.role !== "OWNER") {
      return NextResponse.json(
        { error: "Sem permissão (apenas OWNER)" },
        { status: 403 }
      );
    }

    // ✅ Paywall (trial/premium)
    const now = new Date();
    const hasTrial = owner.trialEndsAt && owner.trialEndsAt > now;

    const hasPremiumStripe =
      owner.stripeStatus === "active" ||
      owner.stripeStatus === "trialing" ||
      owner.ownerPaid === true;

    const allowed = Boolean(hasTrial || hasPremiumStripe);

    if (!allowed) {
      return NextResponse.json(
        { error: "❌ Sem acesso (paywall). Ative o Trial ou vire Premium." },
        { status: 403 }
      );
    }

    const body = await req.json();

    const fullName = String(body?.fullName || "").trim();
    const email = String(body?.email || "").trim().toLowerCase();
    const address = String(body?.address || "").trim();
    const cep = String(body?.cep || "").trim();
    const cpf = String(body?.cpf || "").trim();
    const rg = String(body?.rg || "").trim();
    const birthDate = String(body?.birthDate || "").trim();

    if (!fullName || !email || !address || !cep || !cpf || !rg || !birthDate) {
      return NextResponse.json(
        { error: "Preencha todos os campos." },
        { status: 400 }
      );
    }

    // ✅ senha padrão
    const passwordHash = await bcrypt.hash("123456", 10);

    // ✅ cria tudo junto (User TENANT + TenantProfile)
    const tenantUser = await prisma.user.create({
      data: {
        email,
        name: fullName,
        passwordHash,
        role: "TENANT",
        mustChangePassword: true,
        birthDate: new Date(birthDate),

        tenantProfile: {
          create: {
            ownerId: owner.id,
            fullName,
            cpf,
            rg,
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
      message: "✅ Inquilino criado com sucesso",
      tenant: {
        id: tenantUser.id,
        email: tenantUser.email,
        name: tenantUser.name,
        mustChangePassword: tenantUser.mustChangePassword,
        profile: tenantUser.tenantProfile,
      },
    });
  } catch (err: any) {
    console.error("❌ erro criar tenant:", err?.message || err);

    // erros comuns de unique
    if (err?.code === "P2002") {
      return NextResponse.json(
        { error: "Email ou CPF já cadastrado." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Erro interno ao cadastrar inquilino" },
      { status: 500 }
    );
  }
}

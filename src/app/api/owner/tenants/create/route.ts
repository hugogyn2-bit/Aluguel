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
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    if (owner.role !== "OWNER") {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    // ✅ PAYWALL: só deixa cadastrar se tiver trial ou premium
    const now = new Date();
    const allowed =
      owner.ownerPaid === true || (owner.trialEndsAt && owner.trialEndsAt > now);

    if (!allowed) {
      return NextResponse.json(
        { error: "❌ Sem acesso. Ative o Trial ou vire Premium." },
        { status: 403 }
      );
    }

    const body = await req.json();

    const fullName = String(body?.name || "").trim();
    const email = String(body?.email || "").trim().toLowerCase();
    const address = String(body?.address || "").trim();
    const cep = String(body?.cep || "").trim();
    const cpf = String(body?.cpf || "").trim();
    const rg = String(body?.rg || "").trim();
    const birthDate = String(body?.birthDate || "").trim(); // YYYY-MM-DD

    if (!fullName || !email || !cpf || !rg || !address || !cep) {
      return NextResponse.json(
        { error: "Preencha todos os campos obrigatórios." },
        { status: 400 }
      );
    }

    // ✅ cria uma senha temporária
    const tempPassword = Math.random().toString(36).slice(-10) + "A1!";
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    // ✅ cria TENANT user + profile
    const tenantUser = await prisma.user.create({
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
            address,
            cep,
            email,
            birthDate: birthDate ? new Date(birthDate) : null,
          },
        },
      },
      include: {
        tenantProfile: true,
      },
    });

    return NextResponse.json({
      message: "✅ Inquilino cadastrado com sucesso!",
      tenant: tenantUser,
      tempPassword, // ⚠️ ideal enviar por email, mas por enquanto devolve aqui
    });
  } catch (err: any) {
    console.error("❌ Erro ao cadastrar inquilino:", err?.message || err);

    // Prisma unique error
    if (err?.code === "P2002") {
      return NextResponse.json(
        { error: "Já existe um inquilino com esse email ou CPF." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erro interno ao cadastrar inquilino" },
      { status: 500 }
    );
  }
}

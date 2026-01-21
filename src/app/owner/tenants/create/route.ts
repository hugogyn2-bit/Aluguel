import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
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

    const body = await req.json();

    const name = String(body?.name || "").trim();
    const email = String(body?.email || "").trim();

    const address = String(body?.address || "").trim();
    const cep = String(body?.cep || "").trim();

    const cpf = String(body?.cpf || "").trim();
    const rg = String(body?.rg || "").trim();

    const birthDate = String(body?.birthDate || "").trim(); // YYYY-MM-DD

    if (!name || !email) {
      return NextResponse.json(
        { error: "Nome e email são obrigatórios" },
        { status: 400 }
      );
    }

    // ✅ AQUI É ONDE VOCÊ VAI CRIAR NO BANCO
    // ⚠️ Eu NÃO sei qual é o nome do seu Model do Prisma.
    // Então vou deixar 2 opções abaixo:
    //
    // ✅ Opção A: model Tenant
    // ✅ Opção B: model TenantProfile

    // 🔥 OPÇÃO A (se no Prisma for Tenant)
    // const tenant = await prisma.tenant.create({
    //   data: {
    //     ownerId: owner.id,
    //     name,
    //     email,
    //     address,
    //     cep,
    //     cpf,
    //     rg,
    //     birthDate: birthDate ? new Date(birthDate) : null,
    //   },
    // });

    // 🔥 OPÇÃO B (se no Prisma for TenantProfile)
    const tenant = await prisma.tenantProfile.create({
      data: {
        ownerId: owner.id,
        name,
        email,
        address,
        cep,
        cpf,
        rg,
        birthDate: birthDate ? new Date(birthDate) : null,
      },
    });

    return NextResponse.json({
      message: "✅ Inquilino cadastrado com sucesso!",
      tenant,
    });
  } catch (err: any) {
    console.error("❌ Erro ao cadastrar inquilino:", err?.message || err);

    return NextResponse.json(
      { error: "Erro interno ao cadastrar inquilino" },
      { status: 500 }
    );
  }
}

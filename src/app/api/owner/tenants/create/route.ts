import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function onlyDigits(v: string) {
  return (v || "").replace(/\D/g, "");
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const owner = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!owner || owner.role !== "OWNER") {
      return NextResponse.json({ error: "Apenas OWNER" }, { status: 403 });
    }

    const body = await req.json();

    const fullName = (body.fullName || "").trim();
    const email = (body.email || "").trim().toLowerCase();
    const address = (body.address || "").trim();
    const cep = (body.cep || "").trim();
    const city = (body.city || "").trim();
    const cpf = onlyDigits(body.cpf || "");
    const rg = (body.rg || "").trim();
    const phone = (body.phone || "").trim();

    const rentValue = (body.rentValue || "").toString().trim(); // "29,90" ou "1200"

    if (!fullName || !email || !address || !cep || !city || !cpf || !rg || !phone || !rentValue) {
      return NextResponse.json({ error: "Preencha todos os campos" }, { status: 400 });
    }

    // converte aluguel para centavos (aceita 1200, 1200.00, 1.200,00 etc)
    const normalized = rentValue
      .replace(/\./g, "")
      .replace(",", ".")
      .replace(/[^\d.]/g, "");

    const rentValueFloat = Number(normalized);
    if (!rentValueFloat || rentValueFloat <= 0) {
      return NextResponse.json({ error: "Valor do aluguel inválido" }, { status: 400 });
    }

    const rentValueCents = Math.round(rentValueFloat * 100);

    const existsEmail = await prisma.user.findUnique({ where: { email } });
    if (existsEmail) {
      return NextResponse.json({ error: "Já existe usuário com esse e-mail" }, { status: 400 });
    }

    const existsCpf = await prisma.tenantProfile.findUnique({
      where: { cpf },
    });

    if (existsCpf) {
      return NextResponse.json({ error: "CPF já cadastrado" }, { status: 400 });
    }

    // senha automática 123456 + mustChangePassword
    const passwordHash = await bcrypt.hash("123456", 10);

    // ✅ cria tenant (User) + profile + contrato tudo junto
    const created = await prisma.$transaction(async (tx) => {
      const tenantUser = await tx.user.create({
        data: {
          email,
          name: fullName,
          passwordHash,
          role: "TENANT",
          mustChangePassword: true,
        },
      });

      const tenantProfile = await tx.tenantProfile.create({
        data: {
          userId: tenantUser.id,
          ownerId: owner.id,

          fullName,
          cpf,
          rg,
          address,
          cep,
          city,
          phone,

          rentValueCents,
        },
      });

      // ✅ contrato preenchido automaticamente (cidade + data do dia)
      const today = new Date();

      const contractText = `
CONTRATO DE LOCAÇÃO

Assinado em ${city}, na data ${today.toLocaleDateString("pt-BR")}.

LOCADOR: ${owner.name ?? "Proprietário"}
INQUILINO: ${fullName}
CPF: ${cpf}
RG: ${rg}
ENDEREÇO: ${address}
CEP: ${cep}
TELEFONE: ${phone}

VALOR DO ALUGUEL: R$ ${(rentValueCents / 100).toFixed(2).replace(".", ",")}

(Conteúdo do contrato completo será exibido na tela e validado por assinatura digital)
      `.trim();

      const contract = await tx.rentalContract.create({
        data: {
          tenantProfileId: tenantProfile.id,
          ownerId: owner.id,
          status: "DRAFT",
          contractText,
          signedCity: city,
          signedAtDate: today,
          rentValueCents,
        },
      });

      return { tenantUser, tenantProfile, contract };
    });

    return NextResponse.json({
      message: "Inquilino cadastrado com sucesso ✅",
      tenantEmail: created.tenantUser.email,
      tenantPassword: "123456",
      contractId: created.contract.id,
    });
  } catch (err: any) {
    console.error("❌ Erro ao criar tenant:", err?.message || err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

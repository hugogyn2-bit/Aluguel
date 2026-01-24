import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function onlyNumbers(value: string) {
  return value.replace(/\D/g, "");
}

function parseBirthDateISO(birthDate: string) {
  // "yyyy-mm-dd" -> Date
  // exemplo: "2026-01-24"
  const date = new Date(birthDate);

  if (isNaN(date.getTime())) return null;

  return date;
}

function generateContractText(params: {
  city: string;
  fullName: string;
  cpf: string;
  rg: string;
  address: string;
  cep: string;
  email: string;
  phone: string;
  rentValueCents: number;
  createdAt: Date;
}) {
  const rentBR = (params.rentValueCents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  const dateBR = params.createdAt.toLocaleDateString("pt-BR");

  return `
CONTRATO DE LOCAÇÃO RESIDENCIAL (OPÇÃO A)

CIDADE: ${params.city}
DATA: ${dateBR}

LOCATÁRIO (INQUILINO):
Nome: ${params.fullName}
CPF: ${params.cpf}
RG: ${params.rg}
E-mail: ${params.email}
Telefone: ${params.phone}

ENDEREÇO DO IMÓVEL LOCADO:
${params.address}
CEP: ${params.cep}
Cidade: ${params.city}

VALOR DO ALUGUEL:
${rentBR}

CLÁUSULAS:
1) O LOCATÁRIO declara estar ciente e de acordo com os termos de locação.
2) O pagamento deverá ser realizado mensalmente conforme combinado entre as partes.
3) Este contrato será válido após assinatura digital de ambas as partes.

ASSINATURAS:
- LOCADOR (PROPRIETÁRIO): Assinatura digital (desenho)
- LOCATÁRIO (INQUILINO): Assinatura digital (desenho)
`.trim();
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
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    const body = await req.json();

    const {
      fullName,
      email,
      cpf,
      rg,
      address,
      cep,
      city,
      phone,
      birthDate, // ✅ yyyy-mm-dd
      rentValueCents, // ✅ number (centavos)
    } = body;

    if (
      !fullName ||
      !email ||
      !cpf ||
      !rg ||
      !address ||
      !cep ||
      !city ||
      !phone ||
      !birthDate ||
      rentValueCents === undefined
    ) {
      return NextResponse.json(
        { error: "Preencha todos os campos do inquilino." },
        { status: 400 }
      );
    }

    const cpfClean = onlyNumbers(cpf);
    const cepClean = onlyNumbers(cep);
    const phoneClean = onlyNumbers(phone);

    if (cpfClean.length !== 11) {
      return NextResponse.json({ error: "CPF inválido." }, { status: 400 });
    }

    if (cepClean.length !== 8) {
      return NextResponse.json({ error: "CEP inválido." }, { status: 400 });
    }

    const parsedBirthDate = parseBirthDateISO(birthDate);
    if (!parsedBirthDate) {
      return NextResponse.json(
        { error: "Data de nascimento inválida." },
        { status: 400 }
      );
    }

    const rentCents = Number(rentValueCents);
    if (!rentCents || rentCents <= 0) {
      return NextResponse.json(
        { error: "Valor do aluguel inválido." },
        { status: 400 }
      );
    }

    // ✅ cria senha padrão do tenant
    const defaultPassword = "123456";
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    const now = new Date();

    const result = await prisma.$transaction(async (tx) => {
      // ✅ evita erro de email duplicado
      const existingEmail = await tx.user.findUnique({
        where: { email },
      });

      if (existingEmail) {
        throw new Error("EMAIL_ALREADY_EXISTS");
      }

      // 1) cria User TENANT
      const tenantUser = await tx.user.create({
        data: {
          email,
          name: fullName,
          passwordHash,
          role: "TENANT",
          cpf: cpfClean,
          birthDate: parsedBirthDate,
          mustChangePassword: true,
        },
      });

      // 2) cria TenantProfile
      const tenantProfile = await tx.tenantProfile.create({
        data: {
          userId: tenantUser.id,
          ownerId: owner.id,

          fullName,
          cpf: cpfClean,
          rg,
          email,
          phone: phoneClean,

          address,
          cep: cepClean,
          city,

          birthDate: parsedBirthDate,

          rentValueCents: rentCents,
        },
      });

      // 3) cria contrato preenchido
      const contractText = generateContractText({
        city,
        fullName,
        cpf: cpfClean,
        rg,
        address,
        cep: cepClean,
        email,
        phone: phoneClean,
        rentValueCents: rentCents,
        createdAt: now,
      });

      const contract = await tx.rentalContract.create({
        data: {
          tenantProfileId: tenantProfile.id,
          ownerId: owner.id,
          status: "PENDING_SIGNATURES",

          contractText,
          signedCity: city,
          signedAtDate: now,

          rentValueCents: rentCents,
        },
      });

      return { tenantUser, tenantProfile, contract };
    });

    return NextResponse.json({
      message: "✅ Inquilino cadastrado e contrato gerado com sucesso!",
      tenantId: result.tenantProfile.id,
      contractId: result.contract.id,
      defaultPassword: "123456",
      mustChangePassword: true,
    });
  } catch (err: any) {
    console.error("❌ Erro ao criar tenant + contrato:", err?.message || err);

    // ✅ mensagens melhores
    if (err?.message === "EMAIL_ALREADY_EXISTS") {
      return NextResponse.json(
        { error: "Já existe um usuário com esse email." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erro interno ao cadastrar inquilino." },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const schema = z.object({
  fullName: z.string().min(3, "Nome obrigatório"),
  email: z.string().email("Email inválido"),
  address: z.string().min(3, "Endereço obrigatório"),
  cep: z.string().min(8, "CEP inválido"),
  cpf: z.string().min(11, "CPF inválido"),
  rg: z.string().min(3, "RG inválido"),
  birthDate: z.string().min(8, "Data de nascimento obrigatória"),
});

function normalize(str: string) {
  return str.trim();
}

function normalizeOnlyNumbers(str: string) {
  return str.replace(/\D/g, "");
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // ✅ pega o OWNER logado
    const owner = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!owner) {
      return NextResponse.json({ error: "Owner não encontrado" }, { status: 404 });
    }

    if (owner.role !== "OWNER") {
      return NextResponse.json(
        { error: "Apenas OWNER pode cadastrar inquilinos" },
        { status: 403 }
      );
    }

    const body = await req.json();

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Dados inválidos",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const fullName = normalize(parsed.data.fullName);
    const email = normalize(parsed.data.email).toLowerCase();
    const address = normalize(parsed.data.address);
    const cep = normalizeOnlyNumbers(parsed.data.cep);
    const cpf = normalizeOnlyNumbers(parsed.data.cpf);
    const rg = normalize(parsed.data.rg);

    // birthDate vem como string -> converte em Date
    // Aceita "YYYY-MM-DD" (recomendado no input type="date")
    const birthDate = new Date(parsed.data.birthDate);

    if (Number.isNaN(birthDate.getTime())) {
      return NextResponse.json(
        { error: "Data de nascimento inválida" },
        { status: 400 }
      );
    }

    // ✅ senha padrão
    const defaultPassword = "123456";
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    // ✅ valida duplicados
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Já existe um usuário com esse email" },
        { status: 409 }
      );
    }

    const existingCpf = await prisma.tenantProfile.findUnique({
      where: { cpf },
    });

    if (existingCpf) {
      return NextResponse.json(
        { error: "Já existe um inquilino cadastrado com esse CPF" },
        { status: 409 }
      );
    }

    // ✅ cria tenant (User) + profile (TenantProfile) juntos
    const createdTenant = await prisma.user.create({
      data: {
        email,
        name: fullName,
        passwordHash,
        role: "TENANT",
        mustChangePassword: true,
        birthDate,

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

    return NextResponse.json(
      {
        message: "✅ Inquilino cadastrado com sucesso!",
        tenant: {
          id: createdTenant.id,
          email: createdTenant.email,
          name: createdTenant.name,
          mustChangePassword: createdTenant.mustChangePassword,
          profile: createdTenant.tenantProfile,
        },
        login: {
          email,
          password: defaultPassword,
        },
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("❌ Erro ao criar tenant:", err?.message || err);

    return NextResponse.json(
      { error: "Erro interno ao cadastrar inquilino" },
      { status: 500 }
    );
  }
}

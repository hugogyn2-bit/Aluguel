"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { getToken } from "next-auth/jwt";
import { headers } from "next/headers";

const createTenantSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4, "Senha muito curta."),
  fullName: z.string().min(3, "Nome muito curto."),
  cpf: z.string().min(11).max(14),
  rg: z.string().min(3),
  address: z.string().min(5),
  cep: z.string().min(8).max(9),
});

function normalizeCpf(cpf: string) {
  return cpf.replace(/\D/g, ""); // só números
}

function normalizeCep(cep: string) {
  return cep.replace(/\D/g, ""); // só números
}

export async function createTenantAction(fd: FormData) {
  // pega token (owner) pela request headers
  const h = await headers();
  const token = await getToken({
    req: { headers: Object.fromEntries(h.entries()) } as any,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) return { ok: false, error: "Não autenticado." };
  if (token.role !== "OWNER") return { ok: false, error: "Apenas OWNER pode criar inquilino." };

  const raw = {
    email: String(fd.get("email") ?? "").trim().toLowerCase(),
    password: String(fd.get("password") ?? ""),
    fullName: String(fd.get("fullName") ?? "").trim(),
    cpf: normalizeCpf(String(fd.get("cpf") ?? "")),
    rg: String(fd.get("rg") ?? "").trim(),
    address: String(fd.get("address") ?? "").trim(),
    cep: normalizeCep(String(fd.get("cep") ?? "")),
  };

  const parsed = createTenantSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Dados inválidos.", issues: parsed.error.issues };

  const { email, password, fullName, cpf, rg, address, cep } = parsed.data;

  const cpfDigits = cpf.replace(/\D/g, "");
  if (cpfDigits.length !== 11) return { ok: false, error: "CPF deve ter 11 números." };
  const ownerId = String(token.id);

  // bloqueia se email já existe
  const existsEmail = await prisma.user.findUnique({ where: { email } });
  if (existsEmail) return { ok: false, error: "E-mail já cadastrado." };

  // bloqueia se cpf já existe
  const existsCpf = await prisma.tenantProfile.findUnique({ where: { cpf } });
  if (existsCpf) return { ok: false, error: "CPF já cadastrado." };

  const tempPassword = cpfDigits; // senha inicial = CPF
  const passwordHash = await bcrypt.hash(tempPassword, 10);

  // cria tudo em transação
  await prisma.$transaction(async (tx) => {
    const tenantUser = await tx.user.create({
      data: {
        email,
        passwordHash,
        role: "TENANT",
          mustChangePassword: true,
        name: fullName,
      },
    });

    await tx.tenantProfile.create({
      data: {
        userId: tenantUser.id,
        ownerId,
        fullName,
        cpf: cpfDigits,
        rg,
        address,
        cep,
      },
    });
  });

  return { ok: true };
}

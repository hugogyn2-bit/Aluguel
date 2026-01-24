"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function createTenantAction(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return { ok: false, error: "Não autenticado" };
    }

    const owner = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!owner) {
      return { ok: false, error: "Usuário dono não encontrado" };
    }

    if (owner.role !== "OWNER") {
      return { ok: false, error: "Acesso negado" };
    }

    // ✅ Pegando dados do formulário
    const fullName = String(formData.get("fullName") || "").trim();
    const cpf = String(formData.get("cpf") || "").trim();
    const rg = String(formData.get("rg") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const address = String(formData.get("address") || "").trim();
    const cep = String(formData.get("cep") || "").trim();
    const city = String(formData.get("city") || "").trim();
    const birthDateRaw = String(formData.get("birthDate") || "").trim();
    const rentValueRaw = String(formData.get("rentValue") || "").trim();

    // ✅ Validações básicas
    if (
      !fullName ||
      !cpf ||
      !rg ||
      !email ||
      !phone ||
      !address ||
      !cep ||
      !city ||
      !birthDateRaw ||
      !rentValueRaw
    ) {
      return { ok: false, error: "Preencha todos os campos obrigatórios" };
    }

    const birthDate = new Date(birthDateRaw);
    if (isNaN(birthDate.getTime())) {
      return { ok: false, error: "Data de nascimento inválida" };
    }

    const rentValueNumber = Number(rentValueRaw);
    if (isNaN(rentValueNumber) || rentValueNumber <= 0) {
      return { ok: false, error: "Valor do aluguel inválido" };
    }

    const rentValueCents = Math.round(rentValueNumber * 100);

    // ✅ Senha padrão (tenant vai trocar no primeiro login)
    const defaultPassword = cpf.replace(/\D/g, "").slice(0, 6) || "123456";
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    // ✅ Transação: cria User TENANT + TenantProfile
    const result = await prisma.$transaction(async (tx) => {
      // ✅ Se já existir User com esse email, bloqueia
      const existingUser = await tx.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new Error("Já existe um usuário com esse e-mail");
      }

      // ✅ Se já existir TenantProfile com esse CPF, bloqueia
      const existingCpf = await tx.tenantProfile.findUnique({
        where: { cpf },
      });

      if (existingCpf) {
        throw new Error("Já existe um inquilino com esse CPF");
      }

      const tenantUser = await tx.user.create({
        data: {
          email,
          name: fullName,
          passwordHash,
          role: "TENANT",
          cpf,
          birthDate,
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
          email,
          phone,

          address,
          cep,
          city,

          birthDate,
          rentValueCents,
        },
      });

      return { tenantUser, tenantProfile };
    });

    return {
      ok: true,
      message: "Inquilino criado com sucesso",
      tenantId: result.tenantProfile.id,
    };
  } catch (err: any) {
    console.error("Erro ao criar inquilino:", err);
    return { ok: false, error: err?.message || "Erro interno" };
  }
}

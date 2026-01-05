// src/app/auth/actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { getToken } from "next-auth/jwt";
import { cookies, headers } from "next/headers";

function nowPlusDays(days: number) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

/** Helpers para ler token em Server Actions */
async function getAuthToken() {
  // next-auth/jwt precisa do "req". Aqui a forma mais simples é usar headers/cookies atuais.
  // Em Next.js App Router, dá para usar headers() e cookies() para montar um Request fake:
  const h = headers();
  const c = cookies();

  const req = new Request("http://localhost", {
    headers: {
      cookie: c.toString(),
      // repassa alguns headers se quiser
      "x-forwarded-host": h.get("x-forwarded-host") ?? "",
      "x-forwarded-proto": h.get("x-forwarded-proto") ?? "",
    },
  });

  return getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET });
}

/* =========================
   SIGN-UP / SIGN-IN
========================= */

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
  role: z.enum(["TENANT", "OWNER"]),
});

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  role: z.enum(["TENANT", "OWNER"]),
});

export async function signUpAction(fd: FormData) {
  const raw = {
    email: String(fd.get("email") ?? "").trim().toLowerCase(),
    password: String(fd.get("password") ?? ""),
    name: String(fd.get("name") ?? "").trim() || undefined,
    role: String(fd.get("role") ?? "TENANT") as "TENANT" | "OWNER",
  };

  const parsed = signUpSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Dados inválidos." };

  const { email, password, name, role } = parsed.data;

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return { ok: false, error: "E-mail já cadastrado." };

  const passwordHash = await bcrypt.hash(password, 10);

  // ✅ trial 3 dias só para OWNER
  const trialEndsAt = role === "OWNER" ? nowPlusDays(3) : null;

  await prisma.user.create({
    data: {
      email,
      name,
      passwordHash,
      role,
      trialEndsAt,
    },
  });

  return { ok: true, redirectTo: `/auth/sign-in?role=${role}` };
}

// (Opcional) você pode nem usar isso se o login é direto via next-auth/react
export async function signInAction(fd: FormData) {
  const raw = {
    email: String(fd.get("email") ?? "").trim().toLowerCase(),
    password: String(fd.get("password") ?? ""),
    role: String(fd.get("role") ?? "TENANT") as "TENANT" | "OWNER",
  };

  const parsed = signInSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Dados inválidos." };

  const { email, password, role } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { ok: false, error: "E-mail ou senha inválidos." };

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return { ok: false, error: "E-mail ou senha inválidos." };

  if (user.role !== role) {
    return { ok: false, error: `Sua conta é do tipo ${user.role}.` };
  }

  return { ok: true, redirectTo: user.role === "OWNER" ? "/owner" : "/tenant" };
}

/* =========================
   OWNER -> CREATE TENANT
========================= */

const createTenantSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  tempPassword: z.string().min(6),
});

export async function createTenantAction(fd: FormData) {
  const token = await getAuthToken();

  if (!token) return { ok: false, error: "Não autenticado." };
  if (token.role !== "OWNER") return { ok: false, error: "Apenas OWNER pode criar inquilino." };

  const raw = {
    fullName: String(fd.get("fullName") ?? "").trim(),
    email: String(fd.get("email") ?? "").trim().toLowerCase(),
    phone: String(fd.get("phone") ?? "").trim() || undefined,
    tempPassword: String(fd.get("tempPassword") ?? ""),
  };

  const parsed = createTenantSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Dados inválidos." };

  const { fullName, email, phone, tempPassword } = parsed.data;

  // não deixa usar email já existente
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return { ok: false, error: "Já existe um usuário com esse e-mail." };

  const passwordHash = await bcrypt.hash(tempPassword, 10);

  // cria user TENANT + TenantProfile ligado ao owner logado
  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email,
        name: fullName,
        passwordHash,
        role: "TENANT",
        ownerPaid: false,
        trialEndsAt: null,
      },
    });

    // ✅ Ajuste os campos conforme seu Prisma TenantProfile
    await tx.tenantProfile.create({
      data: {
        userId: user.id,
        ownerId: String(token.id),
        fullName,
        phone,
      },
    });
  });

  return { ok: true };
}

/* =========================
   TENANT -> CHANGE PASSWORD
========================= */

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
});

export async function tenantChangePasswordAction(fd: FormData) {
  const token = await getAuthToken();

  if (!token) return { ok: false, error: "Não autenticado." };
  if (token.role !== "TENANT") return { ok: false, error: "Apenas TENANT pode trocar senha aqui." };

  const raw = {
    currentPassword: String(fd.get("currentPassword") ?? ""),
    newPassword: String(fd.get("newPassword") ?? ""),
  };

  const parsed = changePasswordSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Dados inválidos." };

  const { currentPassword, newPassword } = parsed.data;

  const user = await prisma.user.findUnique({ where: { id: String(token.id) } });
  if (!user) return { ok: false, error: "Usuário não encontrado." };

  const ok = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!ok) return { ok: false, error: "Senha atual incorreta." };

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  return { ok: true };
}

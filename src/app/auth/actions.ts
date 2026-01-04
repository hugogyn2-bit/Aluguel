"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

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
  const trialEndsAt =
    role === "OWNER" ? new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) : null;

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

export async function signInAction(fd: FormData) {
  const raw = {
    email: String(fd.get("email") ?? "").trim().toLowerCase(),
    password: String(fd.get("password") ?? ""),
    role: String(fd.get("role") ?? "TENANT") as "TENANT" | "OWNER",
  };

  const parsed = signInSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Dados inválidos." };

  const { email, password, role } = parsed.data;

  // ✅ (Opcional) valida antes para dar erro amigável (não é obrigatório)
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { ok: false, error: "E-mail ou senha inválidos." };

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return { ok: false, error: "E-mail ou senha inválidos." };

  if (user.role !== role) {
    return { ok: false, error: `Sua conta é do tipo ${user.role}.` };
  }

  // ✅ AGORA SIM: cria sessão do NextAuth (token/cookie)
  const { signIn }

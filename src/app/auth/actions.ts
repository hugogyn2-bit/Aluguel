"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

function parseBirthDateBR(value: string): Date | null {
  const v = value.trim();
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(v);
  if (!m) return null;
  const dd = Number(m[1]);
  const mm = Number(m[2]);
  const yyyy = Number(m[3]);
  const d = new Date(Date.UTC(yyyy, mm - 1, dd));
  // valida se não virou outra data (ex: 31/02)
  if (d.getUTCFullYear() !== yyyy || d.getUTCMonth() !== mm - 1 || d.getUTCDate() !== dd) return null;
  return d;
}

const ownerSignUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
  birthDate: z.string().min(1), // DD/MM/AAAA
});

export async function signUpOwnerAction(fd: FormData) {
  const raw = {
    email: String(fd.get("email") ?? "").trim().toLowerCase(),
    password: String(fd.get("password") ?? ""),
    name: String(fd.get("name") ?? "").trim() || undefined,
    birthDate: String(fd.get("birthDate") ?? "").trim(),
  };

  const parsed = ownerSignUpSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Dados inválidos." };

  const { email, password, name, birthDate } = parsed.data;
  const birth = parseBirthDateBR(birthDate);
  if (!birth) return { ok: false, error: "Data de nascimento inválida (DD/MM/AAAA)." };

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return { ok: false, error: "E-mail já cadastrado." };

  const passwordHash = await bcrypt.hash(password, 10);
  const trialEndsAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

  await prisma.user.create({
    data: {
      email,
      name,
      passwordHash,
      role: "OWNER",
      birthDate: birth,
      trialEndsAt,
    },
  });

  return { ok: true };
}

const ownerResetSchema = z.object({
  email: z.string().email(),
  birthDate: z.string().min(1),
  newPassword: z.string().min(6),
});

export async function resetOwnerPasswordAction(fd: FormData) {
  const raw = {
    email: String(fd.get("email") ?? "").trim().toLowerCase(),
    birthDate: String(fd.get("birthDate") ?? "").trim(),
    newPassword: String(fd.get("newPassword") ?? ""),
  };

  const parsed = ownerResetSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Dados inválidos." };

  const birth = parseBirthDateBR(parsed.data.birthDate);
  if (!birth) return { ok: false, error: "Data de nascimento inválida (DD/MM/AAAA)." };

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user || user.role !== "OWNER" || !user.birthDate) {
    return { ok: false, error: "Não foi possível validar os dados." };
  }

  const same =
    user.birthDate.getUTCFullYear() === birth.getUTCFullYear() &&
    user.birthDate.getUTCMonth() === birth.getUTCMonth() &&
    user.birthDate.getUTCDate() === birth.getUTCDate();

  if (!same) return { ok: false, error: "Data de nascimento não confere." };

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 10);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

  return { ok: true };
}

"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
});

export async function signUpAction(fd: FormData) {
  const raw = {
    email: String(fd.get("email") ?? "").trim().toLowerCase(),
    password: String(fd.get("password") ?? ""),
    name: String(fd.get("name") ?? "").trim() || undefined,
  };

  const parsed = signUpSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Dados inválidos." };

  const { email, password, name } = parsed.data;

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
      trialEndsAt,
    },
  });

  return { ok: true, redirectTo: "/auth/sign-in" };
}

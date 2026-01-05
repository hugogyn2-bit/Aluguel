"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getToken } from "next-auth/jwt";
import { headers } from "next/headers";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  fullName: z.string().min(2),
  phone: z.string().optional(),
  tempPassword: z.string().min(6),
});

export async function createTenantAction(fd: FormData) {
  // ✅ pega o token do request atual
  const h = headers();
  const req = { headers: Object.fromEntries(h.entries()) } as any;

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return { ok: false, error: "Não autenticado." };
  if (token.role !== "OWNER") return { ok: false, error: "Apenas OWNER." };

  const raw = {
    email: String(fd.get("email") ?? "").trim().toLowerCase(),
    fullName: String(fd.get("fullName") ?? "").trim(),
    phone: String(fd.get("phone") ?? "").trim() || undefined,
    tempPassword: String(fd.get("tempPassword") ?? ""),
  };

  const parsed = schema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Dados inválidos." };

  const { email, fullName, phone, tempPassword } = parsed.data;

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return { ok: false, error: "E-mail já existe." };

  const passwordHash = await bcrypt.hash(tempPassword, 10);

  // 1) cria o user TENANT
  const tenantUser = await prisma.user.create({
    data: {
      email,
      name: fullName,
      passwordHash,
      role: "TENANT",
    },
  });

  // 2) cria o profile e liga ao owner
  await prisma.tenantProfile.create({
    data: {
      fullName,
      phone,
      ownerId: String(token.id),
      userId: tenantUser.id,
    },
  });

  return { ok: true };
}

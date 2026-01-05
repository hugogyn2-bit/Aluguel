"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getToken } from "next-auth/jwt";
import { redirect } from "next/navigation";
import { z } from "zod";
import { headers } from "next/headers";

const createTenantSchema = z.object({
  fullName: z.string().min(2, "Nome muito curto"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  tempPassword: z.string().min(6, "Senha mínima é 6"),
});

export async function createTenantAction(fd: FormData) {
  // ✅ pega request headers pra conseguir ler o token no Server Action
  const h = await headers();

  const token = await getToken({
    req: { headers: Object.fromEntries(h.entries()) } as any,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    // não autenticado -> manda pro login do OWNER
    redirect("/auth/sign-in?role=OWNER");
  }

  if ((token as any).role !== "OWNER") {
    throw new Error("Somente OWNER pode criar inquilino.");
  }

  const raw = {
    fullName: String(fd.get("fullName") ?? "").trim(),
    email: String(fd.get("email") ?? "").trim().toLowerCase(),
    phone: String(fd.get("phone") ?? "").trim() || undefined,
    tempPassword: String(fd.get("tempPassword") ?? ""),
  };

  const parsed = createTenantSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: "Dados inválidos. Verifique os campos." };
  }

  const { fullName, email, phone, tempPassword } = parsed.data;

  // ✅ checa se já existe usuário com esse e-mail
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    return { ok: false, error: "Já existe um usuário com esse e-mail." };
  }

  // ✅ cria usuário TENANT
  const passwordHash = await bcrypt.hash(tempPassword, 10);

  const ownerId = String((token as any).id);

  await prisma.user.create({
    data: {
      email,
      name: fullName,
      passwordHash,
      role: "TENANT",
      ownerPaid: false,
      trialEndsAt: null,
      tenantProfile: {
        create: {
          fullName,
          phone,
          ownerId,
        },
      },
    },
  });

  // ✅ volta para a lista (ou a própria página) com sucesso
  return { ok: true };
}

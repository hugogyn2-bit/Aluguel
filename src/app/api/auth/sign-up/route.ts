import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

function parseBRDateToISO(dateStr: string) {
  // dd/mm/aaaa -> yyyy-mm-dd
  const [dd, mm, yyyy] = dateStr.split("/");
  if (!dd || !mm || !yyyy) return null;
  return `${yyyy}-${mm}-${dd}`;
}

const schema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  email: z.string().email("Email inválido"),
  cpf: z
    .string()
    .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, "CPF inválido (000.000.000-00)"),
  birthDate: z
    .string()
    .regex(/^\d{2}\/\d{2}\/\d{4}$/, "Data inválida (dd/mm/aaaa)"),
  password: z.string().min(6, "Senha mínima 6 caracteres"),
});

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Dados inválidos" },
        { status: 400 }
      );
    }

    const { name, email, cpf, birthDate, password } = parsed.data;

    const iso = parseBRDateToISO(birthDate);
    if (!iso) {
      return NextResponse.json(
        { error: "Data inválida" },
        { status: 400 }
      );
    }

    const birth = new Date(iso);

    const existingEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingEmail) {
      return NextResponse.json(
        { error: "E-mail já cadastrado" },
        { status: 400 }
      );
    }

    // ✅ cpf vai ficar salvo como string limpa pra comparar fácil
    const cpfClean = cpf.replace(/\D/g, "");

    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "OWNER", // ✅ se quiser criar OWNER por padrão
        birthDate: birth,
        cpf: cpfClean,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Erro no sign-up:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

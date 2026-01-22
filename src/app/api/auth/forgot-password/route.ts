import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import crypto from "crypto";

function parseBRDateToISO(dateStr: string) {
  const [dd, mm, yyyy] = dateStr.split("/");
  if (!dd || !mm || !yyyy) return null;
  return `${yyyy}-${mm}-${dd}`;
}

const schema = z.object({
  email: z.string().email(),
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/),
  birthDate: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/),
});

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    const { email, cpf, birthDate } = parsed.data;

    const cpfClean = cpf.replace(/\D/g, "");
    const iso = parseBRDateToISO(birthDate);

    if (!iso) {
      return NextResponse.json({ error: "Data inválida" }, { status: 400 });
    }

    const birth = new Date(iso);

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // ✅ confere CPF e data nascimento
    if (user.cpf !== cpfClean) {
      return NextResponse.json(
        { error: "CPF não confere" },
        { status: 403 }
      );
    }

    if (!user.birthDate) {
      return NextResponse.json(
        { error: "Usuário sem data de nascimento cadastrada" },
        { status: 403 }
      );
    }

    const sameBirth =
      user.birthDate.toISOString().slice(0, 10) === birth.toISOString().slice(0, 10);

    if (!sameBirth) {
      return NextResponse.json(
        { error: "Data de nascimento não confere" },
        { status: 403 }
      );
    }

    // ✅ cria token e salva no banco
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 1000 * 60 * 20); // 20 minutos

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: token,
        resetPasswordExpires: expires,
      },
    });

    // ✅ aqui você poderia mandar email, mas por enquanto devolve token
    return NextResponse.json({ ok: true, token });
  } catch (err) {
    console.error("Erro request reset:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

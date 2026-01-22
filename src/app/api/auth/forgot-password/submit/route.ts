import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export const runtime = "nodejs";

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function parseBirthDateBR(value: string): Date | null {
  // aceita dd/mm/aaaa
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 8) return null;

  const dd = Number(digits.slice(0, 2));
  const mm = Number(digits.slice(2, 4));
  const yyyy = Number(digits.slice(4, 8));

  if (!dd || !mm || !yyyy) return null;
  if (yyyy < 1900 || yyyy > 2100) return null;
  if (mm < 1 || mm > 12) return null;
  if (dd < 1 || dd > 31) return null;

  // cria date (UTC) evitando bug de timezone
  const date = new Date(Date.UTC(yyyy, mm - 1, dd, 0, 0, 0));

  // valida se bate com o que foi digitado (evita 31/02 virar março)
  const checkDay = date.getUTCDate();
  const checkMonth = date.getUTCMonth() + 1;
  const checkYear = date.getUTCFullYear();

  if (checkDay !== dd || checkMonth !== mm || checkYear !== yyyy) return null;

  return date;
}

function sameDateUTC(a: Date, b: Date) {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const email = String(body?.email || "").trim().toLowerCase();
    const cpfMasked = String(body?.cpf || "");
    const birthDateMasked = String(body?.birthDate || "");

    if (!email || !cpfMasked || !birthDateMasked) {
      return NextResponse.json(
        { error: "Preencha e-mail, CPF e data de nascimento." },
        { status: 400 }
      );
    }

    const cpfDigits = onlyDigits(cpfMasked);
    if (cpfDigits.length !== 11) {
      return NextResponse.json(
        { error: "CPF inválido. Use o formato 000.000.000-00" },
        { status: 400 }
      );
    }

    const birthDate = parseBirthDateBR(birthDateMasked);
    if (!birthDate) {
      return NextResponse.json(
        { error: "Data de nascimento inválida. Use dd/mm/aaaa" },
        { status: 400 }
      );
    }

    // ✅ busca usuário pelo email
    const user = await prisma.user.findUnique({
      where: { email },
      include: { tenantProfile: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado." },
        { status: 404 }
      );
    }

    // ✅ CPF vem do TenantProfile (como está no seu Prisma)
    const cpfFromDb = user.tenantProfile?.cpf
      ? onlyDigits(user.tenantProfile.cpf)
      : null;

    if (!cpfFromDb) {
      return NextResponse.json(
        { error: "Este usuário não possui CPF cadastrado." },
        { status: 400 }
      );
    }

    if (cpfFromDb !== cpfDigits) {
      return NextResponse.json(
        { error: "CPF não confere." },
        { status: 401 }
      );
    }

    // ✅ nascimento está no User.birthDate
    if (!user.birthDate) {
      return NextResponse.json(
        { error: "Este usuário não possui data de nascimento cadastrada." },
        { status: 400 }
      );
    }

    if (!sameDateUTC(user.birthDate, birthDate)) {
      return NextResponse.json(
        { error: "Data de nascimento não confere." },
        { status: 401 }
      );
    }

    // ✅ gera token seguro
    const token = crypto.randomBytes(32).toString("hex");

    // expira em 30 minutos
    const expires = new Date(Date.now() + 30 * 60 * 1000);

    // ✅ salva token no banco
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: token,
        resetPasswordExpires: expires,
      },
    });

    // ✅ monta link com seu domínio do Vercel
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) {
      return NextResponse.json(
        { error: "NEXT_PUBLIC_APP_URL não configurada." },
        { status: 500 }
      );
    }

    const resetLink = `${appUrl}/auth/forgot-password/reset?token=${token}`;

    // ✅ em produção você mandaria por e-mail
    return NextResponse.json({
      message: "✅ Link de redefinição gerado com sucesso.",
      resetLink,
    });
  } catch (err: any) {
    console.error("❌ Erro no forgot-password submit:", err?.message || err);

    return NextResponse.json(
      { error: "Erro interno ao gerar link de redefinição." },
      { status: 500 }
    );
  }
}

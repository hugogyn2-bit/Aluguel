import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const email = String(body.email || "").toLowerCase().trim();
    const password = String(body.password || "");
    const birthDateRaw = String(body.birthDate || "");

    if (!email || !password || !birthDateRaw) {
      return NextResponse.json(
        { error: "Dados obrigatórios não informados." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "A senha deve ter pelo menos 6 caracteres." },
        { status: 400 }
      );
    }

    const birthDate = new Date(birthDateRaw);
    if (isNaN(birthDate.getTime())) {
      return NextResponse.json(
        { error: "Data de nascimento inválida." },
        { status: 400 }
      );
    }

    const exists = await prisma.user.findUnique({
      where: { email },
    });

    if (exists) {
      return NextResponse.json(
        { error: "E-mail já cadastrado." },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        email,
        passwordHash,
        birthDate,
        role: "OWNER",
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("SIGN-UP ERROR:", err);
    return NextResponse.json(
      { error: "Erro interno ao criar conta." },
      { status: 500 }
    );
  }
}

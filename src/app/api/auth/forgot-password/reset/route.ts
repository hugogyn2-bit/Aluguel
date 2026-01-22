import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const token = String(body?.token || "").trim();
    const password = String(body?.password || "");

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token e senha são obrigatórios." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "A senha deve ter no mínimo 6 caracteres." },
        { status: 400 }
      );
    }

    // ✅ busca usuário pelo token
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Token inválido." },
        { status: 400 }
      );
    }

    // ✅ valida expiração
    if (!user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
      return NextResponse.json(
        { error: "Token expirado. Faça o processo novamente." },
        { status: 400 }
      );
    }

    // ✅ hash da senha
    const passwordHash = await bcrypt.hash(password, 10);

    // ✅ salva a nova senha e limpa o token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    return NextResponse.json({
      message: "✅ Senha redefinida com sucesso.",
    });
  } catch (err: any) {
    console.error("❌ Erro reset senha:", err?.message || err);

    return NextResponse.json(
      { error: "Erro interno ao redefinir senha." },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const { token, password } = await req.json();

  if (!token || !password) {
    return NextResponse.json(
      { message: "Token e senha obrigatórios." },
      { status: 400 }
    );
  }

  const user = await prisma.user.findFirst({
    where: { resetPasswordToken: token },
  });

  if (!user) {
    return NextResponse.json({ message: "Token inválido." }, { status: 400 });
  }

  if (!user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
    return NextResponse.json({ message: "Token expirado." }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    },
  });

  return NextResponse.json({ message: "Senha redefinida com sucesso!" });
}

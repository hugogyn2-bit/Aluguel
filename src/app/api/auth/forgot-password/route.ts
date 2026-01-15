import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ message: "Email obrigatório." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  // ✅ não revelar se existe ou não
  if (!user) {
    return NextResponse.json({
      message: "Se o email existir, enviaremos o link.",
    });
  }

  const token = crypto.randomBytes(32).toString("hex");

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetPasswordToken: token,
      resetPasswordExpires: new Date(Date.now() + 30 * 60 * 1000), // 30 min
    },
  });

  const resetLink = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`;

  return NextResponse.json({
    message: "Link gerado com sucesso.",
    resetLink, // 🔥 só pra teste (depois você manda por email)
  });
}

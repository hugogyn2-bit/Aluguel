import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  }

  if (user.role !== "OWNER") {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const now = new Date();

  // ✅ se já tem premium
  if (user.ownerPaid) {
    return NextResponse.json({
      ok: true,
      message: "Você já é PREMIUM ✅",
      trialEndsAt: user.trialEndsAt,
    });
  }

  // ✅ se trial ainda está ativo
  if (user.trialEndsAt && user.trialEndsAt > now) {
    return NextResponse.json({
      ok: true,
      message: "Seu TRIAL ainda está ativo ✅",
      trialEndsAt: user.trialEndsAt,
    });
  }

  // ✅ inicia trial de 24h
  const trialEndsAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      trialStartedAt: now,
      trialEndsAt,
    },
  });

  return NextResponse.json({
    ok: true,
    message: "🎉 Trial ativado por 24 horas!",
    trialEndsAt,
  });
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const owner = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!owner || owner.role !== "OWNER") {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const now = new Date();

  // ✅ já tem premium
  if (owner.ownerPaid) {
    return NextResponse.json({
      ok: true,
      message: "Você já é Premium ✅",
    });
  }

  // ✅ já tem trial ativo
  if (owner.trialEndsAt && owner.trialEndsAt > now) {
    return NextResponse.json({
      ok: true,
      message: "Trial já está ativo ✅",
      trialEndsAt: owner.trialEndsAt,
    });
  }

  // ✅ inicia 24 horas a partir de agora
  const trialEndsAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  await prisma.user.update({
    where: { id: owner.id },
    data: {
      trialStartedAt: now,
      trialEndsAt,
    },
  });

  return NextResponse.json({
    ok: true,
    message: "Trial ativado por 24 horas ✅",
    trialEndsAt,
  });
}

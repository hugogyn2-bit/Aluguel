import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });

  if (!user.stripeSubscriptionId) {
    return NextResponse.json({ error: "Nenhuma assinatura ativa" }, { status: 400 });
  }

  const sub = await stripe.subscriptions.update(user.stripeSubscriptionId, {
    cancel_at_period_end: true,
  });

  await prisma.user.update({
    where: { id: user.id },
    data: {
      cancelAtPeriodEnd: sub.cancel_at_period_end,
      stripeStatus: sub.status,
      currentPeriodEnd: new Date(sub.current_period_end * 1000),
    },
  });

  return NextResponse.json({
    ok: true,
    message: "Assinatura cancelada no fim do período ✅",
    currentPeriodEnd: sub.current_period_end,
  });
}

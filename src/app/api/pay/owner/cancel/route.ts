import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST() {
  try {
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

    if (!owner.stripeSubscriptionId) {
      return NextResponse.json(
        { error: "Nenhuma assinatura ativa encontrada." },
        { status: 400 }
      );
    }

    // ✅ cancela no Stripe (no fim do ciclo)
    const sub = await stripe.subscriptions.update(owner.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    // ✅ salva no banco
    await prisma.user.update({
      where: { id: owner.id },
      data: {
        cancelAtPeriodEnd: true,
        stripeStatus: sub.status,
        currentPeriodEnd: new Date(sub.current_period_end * 1000),
      },
    });

    return NextResponse.json({
      ok: true,
      message: "Assinatura marcada para cancelamento no fim do período.",
    });
  } catch (err) {
    console.error("CANCEL SUB ERROR:", err);
    return NextResponse.json(
      { error: "Erro interno ao cancelar assinatura." },
      { status: 500 }
    );
  }
}

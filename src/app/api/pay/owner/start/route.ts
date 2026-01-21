import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Stripe from "stripe";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST() {
  try {
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
      return NextResponse.json({ error: "Apenas OWNER pode assinar" }, { status: 403 });
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      console.error("❌ STRIPE_SECRET_KEY não configurada");
      return NextResponse.json(
        { error: "STRIPE_SECRET_KEY não configurada" },
        { status: 500 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) {
      console.error("❌ NEXT_PUBLIC_APP_URL não configurada");
      return NextResponse.json(
        { error: "NEXT_PUBLIC_APP_URL não configurada" },
        { status: 500 }
      );
    }

    const priceId = process.env.STRIPE_PRICE_ID;
    if (!priceId) {
      console.error("❌ STRIPE_PRICE_ID não configurada");
      return NextResponse.json(
        { error: "STRIPE_PRICE_ID não configurada" },
        { status: 500 }
      );
    }

    const stripe = new Stripe(stripeSecretKey);

    // ✅ se ainda não tem customer no Stripe, cria e salva no banco
    let stripeCustomerId = user.stripeCustomerId;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name ?? undefined,
        metadata: {
          userId: user.id,
          role: user.role,
        },
      });

      stripeCustomerId = customer.id;

      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId },
      });
    }

    // ✅ Checkout Session (Subscription mensal)
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: stripeCustomerId,

      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],

      // ✅ importante: fazer o Stripe aceitar promoções/cupom se quiser
      allow_promotion_codes: true,

      // ✅ redirects
      success_url: `${appUrl}/owner?paid=1`,
      cancel_url: `${appUrl}/owner/premium?cancel=1`,

      // ✅ salva userId pra webhook usar com segurança
      metadata: {
        userId: user.id,
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err: any) {
    console.error("❌ Erro interno ao iniciar pagamento:", err?.message || err);

    return NextResponse.json(
      { error: "Erro interno ao iniciar pagamento" },
      { status: 500 }
    );
  }
}

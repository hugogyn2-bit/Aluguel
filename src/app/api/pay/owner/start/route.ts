import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Stripe from "stripe";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
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

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const stripePriceId = process.env.STRIPE_PRICE_ID;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (!stripeSecretKey) {
      return NextResponse.json(
        { error: "STRIPE_SECRET_KEY não configurada" },
        { status: 500 }
      );
    }

    if (!stripePriceId) {
      return NextResponse.json(
        { error: "STRIPE_PRICE_ID não configurada" },
        { status: 500 }
      );
    }

    if (!appUrl) {
      return NextResponse.json(
        { error: "NEXT_PUBLIC_APP_URL não configurada" },
        { status: 500 }
      );
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2024-06-20",
    });

    // ✅ garante que existe customer no Stripe
    let stripeCustomerId = owner.stripeCustomerId;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: owner.email,
        name: owner.name || undefined,
        metadata: {
          ownerId: owner.id,
        },
      });

      stripeCustomerId = customer.id;

      await prisma.user.update({
        where: { id: owner.id },
        data: {
          stripeCustomerId,
        },
      });
    }

    // ✅ cria checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: stripeCustomerId,
      line_items: [{ price: stripePriceId, quantity: 1 }],
      success_url: `${appUrl}/owner?premium=success`,
      cancel_url: `${appUrl}/owner/premium?premium=cancel`,
      allow_promotion_codes: true,
    });

    return NextResponse.redirect(checkoutSession.url!);
  } catch (err) {
    console.error("Erro Stripe start:", err);
    return NextResponse.json(
      { error: "Erro interno no Stripe (start)" },
      { status: 500 }
    );
  }
}

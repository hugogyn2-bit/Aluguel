import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Stripe from "stripe";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

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

    // ✅ cria customer se não existir
    let stripeCustomerId = owner.stripeCustomerId;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: owner.email,
        name: owner.name || "Proprietário",
      });

      stripeCustomerId = customer.id;

      await prisma.user.update({
        where: { id: owner.id },
        data: { stripeCustomerId },
      });
    }

    // ✅ cria checkout
    const checkout = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID!, // 🔥 IMPORTANTE
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXTAUTH_URL}/owner?premium=success`,
      cancel_url: `${process.env.NEXTAUTH_URL}/owner?premium=cancel`,
    });

    return NextResponse.json({ url: checkout.url });
  } catch (err) {
    console.error("Erro Stripe start:", err);
    return NextResponse.json(
      { error: "Erro ao iniciar pagamento" },
      { status: 500 }
    );
  }
}

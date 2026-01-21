import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    const priceId = process.env.STRIPE_PRICE_ID;

    if (!stripeSecretKey) {
      return NextResponse.json(
        { error: "STRIPE_SECRET_KEY não configurada" },
        { status: 500 }
      );
    }

    if (!appUrl) {
      return NextResponse.json(
        { error: "NEXT_PUBLIC_APP_URL não configurada" },
        { status: 500 }
      );
    }

    if (!priceId) {
      return NextResponse.json(
        { error: "STRIPE_PRICE_ID não configurada" },
        { status: 500 }
      );
    }

    // ✅ NÃO define apiVersion (evita erro TS)
    const stripe = new Stripe(stripeSecretKey);

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || user.role !== "OWNER") {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    // ✅ cria customer se não existir
    let customerId = user.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId: user.id },
      });

      customerId = customer.id;

      await prisma.user.update({
        where: { id: user.id },
        data: {
          stripeCustomerId: customerId,
        },
      });
    }

    // ✅ cria checkout
    const checkout = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/owner?payment=success`,
      cancel_url: `${appUrl}/paywall?payment=cancelled`,
    });

    return NextResponse.json({ url: checkout.url });
  } catch (err) {
    console.error("CHECKOUT ERROR:", err);
    return NextResponse.json(
      { error: "Erro interno ao iniciar pagamento" },
      { status: 500 }
    );
  }
}

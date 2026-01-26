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

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || user.role !== "OWNER") {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const priceId = process.env.STRIPE_PRICE_ID;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (!stripeSecretKey || !priceId || !appUrl) {
      return NextResponse.json(
        { error: "Stripe não configurado (env faltando)" },
        { status: 500 }
      );
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2024-06-20",
    });

    let customerId = user.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || "Owner",
      });

      customerId = customer.id;

      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    const checkout = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/owner/premium?success=1`,
      cancel_url: `${appUrl}/owner/premium?canceled=1`,
    });

    return NextResponse.json({ url: checkout.url });
  } catch (err) {
    console.error("Erro Stripe start:", err);
    return NextResponse.json(
      { error: "Erro interno no Stripe" },
      { status: 500 }
    );
  }
}

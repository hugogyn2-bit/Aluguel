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

  let customerId = owner.stripeCustomerId;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: owner.email,
      name: owner.name ?? undefined,
    });

    customerId = customer.id;

    await prisma.user.update({
      where: { id: owner.id },
      data: { stripeCustomerId: customerId },
    });
  }

  const checkout = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [
      {
        price: process.env.STRIPE_PRICE_ID!,
        quantity: 1,
      },
    ],
    subscription_data: {
      trial_period_hours: 24, // 🔥 TRIAL 24H
    },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/owner`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/owner/premium`,
  });

  return NextResponse.json({ url: checkout.url });
}

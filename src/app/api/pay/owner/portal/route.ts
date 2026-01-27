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

    if (!owner.stripeCustomerId) {
      return NextResponse.json(
        { error: "Cliente Stripe não encontrado" },
        { status: 400 }
      );
    }

    const portal = await stripe.billingPortal.sessions.create({
      customer: owner.stripeCustomerId,
      return_url: `${process.env.NEXTAUTH_URL}/owner`,
    });

    return NextResponse.json({ url: portal.url });
  } catch (err) {
    console.error("Erro Stripe portal:", err);
    return NextResponse.json(
      { error: "Erro ao abrir portal" },
      { status: 500 }
    );
  }
}

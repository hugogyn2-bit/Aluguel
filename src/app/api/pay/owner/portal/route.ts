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
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (!stripeSecretKey || !appUrl) {
      return NextResponse.json(
        { error: "Stripe não configurado (env faltando)" },
        { status: 500 }
      );
    }

    if (!user.stripeCustomerId) {
      return NextResponse.json(
        { error: "Cliente Stripe não existe ainda" },
        { status: 400 }
      );
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2024-06-20",
    });

    const portal = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${appUrl}/owner/premium`,
    });

    return NextResponse.json({ url: portal.url });
  } catch (err) {
    console.error("Erro Stripe portal:", err);
    return NextResponse.json(
      { error: "Erro interno no Stripe portal" },
      { status: 500 }
    );
  }
}

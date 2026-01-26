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
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

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

    if (!owner.stripeCustomerId) {
      return NextResponse.json(
        { error: "Você ainda não tem customer no Stripe" },
        { status: 400 }
      );
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2024-06-20",
    });

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: owner.stripeCustomerId,
      return_url: `${appUrl}/owner`,
    });

    return NextResponse.redirect(portalSession.url);
  } catch (err) {
    console.error("Erro Stripe portal:", err);
    return NextResponse.json(
      { error: "Erro interno no Stripe (portal)" },
      { status: 500 }
    );
  }
}

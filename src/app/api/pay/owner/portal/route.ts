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

    // ✅ IMPORTANTE: não colocar apiVersion aqui (evita erro TS)
    const stripe = new Stripe(stripeSecretKey);

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || user.role !== "OWNER") {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    if (!user.stripeCustomerId) {
      return NextResponse.json(
        { error: "Usuário sem Stripe Customer" },
        { status: 400 }
      );
    }

    // ✅ Customer Portal (cancelar / gerenciar assinatura)
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${appUrl}/owner`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (err) {
    console.error("PORTAL ERROR:", err);
    return NextResponse.json(
      { error: "Erro interno ao abrir portal" },
      { status: 500 }
    );
  }
}

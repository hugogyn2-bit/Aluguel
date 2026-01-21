import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// ⚠️ Necessário pro Stripe webhook ler o "raw body"
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!stripeSecretKey) {
      return NextResponse.json(
        { error: "STRIPE_SECRET_KEY não configurada" },
        { status: 500 }
      );
    }

    if (!webhookSecret) {
      return NextResponse.json(
        { error: "STRIPE_WEBHOOK_SECRET não configurada" },
        { status: 500 }
      );
    }

    // ✅ NÃO DEFINIR apiVersion (pra não dar erro TS)
    const stripe = new Stripe(stripeSecretKey);

    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Assinatura Stripe ausente" },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature error:", err);
      return NextResponse.json(
        { error: "Webhook inválido (assinatura)" },
        { status: 400 }
      );
    }

    // ✅ EVENTOS IMPORTANTES
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        const customerId =
          typeof session.customer === "string"
            ? session.customer
            : session.customer?.id;

        const subscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id;

        if (!customerId) break;

        await prisma.user.updateMany({
          where: { stripeCustomerId: customerId },
          data: {
            ownerPaid: true,
            stripeSubscriptionId: subscriptionId ?? null,
            stripeStatus: "active",
          },
        });

        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;

        const customerId =
          typeof sub.customer === "string" ? sub.customer : sub.customer.id;

        await prisma.user.updateMany({
          where: { stripeCustomerId: customerId },
          data: {
            ownerPaid: sub.status === "active" || sub.status === "trialing",
            stripeSubscriptionId: sub.id,
            stripeStatus: sub.status,
            stripePriceId:
              sub.items.data[0]?.price?.id ? sub.items.data[0].price.id : null,
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
            cancelAtPeriodEnd: sub.cancel_at_period_end ?? false,
          },
        });

        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;

        const customerId =
          typeof sub.customer === "string" ? sub.customer : sub.customer.id;

        await prisma.user.updateMany({
          where: { stripeCustomerId: customerId },
          data: {
            ownerPaid: false,
            stripeSubscriptionId: null,
            stripeStatus: "canceled",
            currentPeriodEnd: null,
            cancelAtPeriodEnd: false,
          },
        });

        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;

        const customerId =
          typeof invoice.customer === "string"
            ? invoice.customer
            : invoice.customer?.id;

        if (!customerId) break;

        await prisma.user.updateMany({
          where: { stripeCustomerId: customerId },
          data: {
            stripeStatus: "active",
            ownerPaid: true,
          },
        });

        break;
      }

      default:
        // eventos ignorados
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("WEBHOOK ERROR:", err);
    return NextResponse.json(
      { error: "Erro interno no webhook" },
      { status: 500 }
    );
  }
}

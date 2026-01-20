import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

/**
 * ✅ Stripe precisa do BODY "raw" (sem JSON.parse antes),
 * por isso usamos req.text()
 */
export async function POST(req: Request) {
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

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: "2024-06-20",
  });

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json(
      { error: "stripe-signature não encontrado" },
      { status: 400 }
    );
  }

  const body = await req.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error("❌ Webhook signature inválida:", err?.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    // ======================================================
    // ✅ checkout.session.completed (assinatura feita)
    // ======================================================
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      // IMPORTANTE: você precisa passar isso na criação do checkout:
      // metadata: { userId: sessionUserId }
      const userId = session.metadata?.userId;

      if (!userId) {
        console.warn("⚠️ checkout.session.completed sem metadata.userId");
        return NextResponse.json({ ok: true });
      }

      const customerId =
        typeof session.customer === "string" ? session.customer : null;

      const subscriptionId =
        typeof session.subscription === "string" ? session.subscription : null;

      // Se tiver subscriptionId, buscamos mais infos reais
      let subscription: Stripe.Subscription | null = null;

      if (subscriptionId) {
        subscription = await stripe.subscriptions.retrieve(subscriptionId);
      }

      await prisma.user.update({
        where: { id: userId },
        data: {
          stripeCustomerId: customerId ?? undefined,
          stripeSubscriptionId: subscriptionId ?? undefined,

          stripeStatus: subscription?.status ?? "active",
          currentPeriodEnd: subscription?.current_period_end
            ? new Date(subscription.current_period_end * 1000)
            : undefined,

          cancelAtPeriodEnd: subscription?.cancel_at_period_end ?? false,

          ownerPaid: true,
          premiumStartedAt: new Date(),
        },
      });

      console.log("✅ checkout.session.completed -> PREMIUM OK", {
        userId,
        customerId,
        subscriptionId,
      });

      return NextResponse.json({ received: true });
    }

    // ======================================================
    // ✅ customer.subscription.created / updated
    // ======================================================
    if (
      event.type === "customer.subscription.created" ||
      event.type === "customer.subscription.updated"
    ) {
      const subscription = event.data.object as Stripe.Subscription;

      const customerId =
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer.id;

      // pega o priceId da primeira linha
      const priceId =
        subscription.items.data[0]?.price?.id ||
        subscription.items.data[0]?.plan?.id ||
        null;

      // ✅ status premium real
      const isPaid =
        subscription.status === "active" || subscription.status === "trialing";

      await prisma.user.updateMany({
        where: {
          stripeCustomerId: customerId,
        },
        data: {
          stripeSubscriptionId: subscription.id,
          stripeStatus: subscription.status,
          stripePriceId: priceId ?? undefined,
          currentPeriodEnd: subscription.current_period_end
            ? new Date(subscription.current_period_end * 1000)
            : undefined,
          cancelAtPeriodEnd: subscription.cancel_at_period_end ?? false,

          ownerPaid: isPaid,

          // ✅ só seta premiumStartedAt se virou premium agora
          premiumStartedAt: isPaid ? new Date() : undefined,
        },
      });

      console.log(
        `✅ ${event.type} -> atualizado no Prisma`,
        subscription.id
      );

      return NextResponse.json({ received: true });
    }

    // ======================================================
    // ✅ customer.subscription.deleted (cancelou / acabou)
    // ======================================================
    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;

      const customerId =
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer.id;

      await prisma.user.updateMany({
        where: {
          stripeCustomerId: customerId,
        },
        data: {
          stripeStatus: "canceled",
          ownerPaid: false,
          stripeSubscriptionId: null,
          cancelAtPeriodEnd: false,
          currentPeriodEnd: null,
        },
      });

      console.log("✅ subscription.deleted -> premium removido");

      return NextResponse.json({ received: true });
    }

    // ======================================================
    // ✅ invoice.payment_succeeded (pagamento confirmado)
    // (não é obrigatório, mas ajuda caso falhe algo acima)
    // ======================================================
    if (event.type === "invoice.payment_succeeded") {
      const invoice = event.data.object as Stripe.Invoice;

      const customerId =
        typeof invoice.customer === "string" ? invoice.customer : null;

      if (!customerId) return NextResponse.json({ received: true });

      // Se tiver subscription, atualiza período e marca premium
      const subscriptionId =
        typeof invoice.subscription === "string"
          ? invoice.subscription
          : invoice.subscription?.id;

      if (!subscriptionId) return NextResponse.json({ received: true });

      const subscription = await stripe.subscriptions.retrieve(subscriptionId);

      const isPaid =
        subscription.status === "active" || subscription.status === "trialing";

      await prisma.user.updateMany({
        where: {
          stripeCustomerId: customerId,
        },
        data: {
          stripeStatus: subscription.status,
          stripeSubscriptionId: subscription.id,
          currentPeriodEnd: subscription.current_period_end
            ? new Date(subscription.current_period_end * 1000)
            : undefined,
          cancelAtPeriodEnd: subscription.cancel_at_period_end ?? false,
          ownerPaid: isPaid,
        },
      });

      console.log("✅ invoice.payment_succeeded -> atualizado");
      return NextResponse.json({ received: true });
    }

    // ✅ outros eventos = ignorar
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("❌ Erro no webhook:", err);
    return NextResponse.json(
      { error: "Webhook handler error" },
      { status: 500 }
    );
  }
}

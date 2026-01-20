import { prisma } from "@/lib/prisma";

export async function isOwnerPremium(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return false;

  const now = new Date();

  // ✅ Premium ativo pelo Stripe
  const stripeActive =
    user.stripeStatus === "active" || user.stripeStatus === "trialing";

  if (stripeActive) return true;

  // ✅ Trial ativo (24h)
  if (user.trialEndsAt && user.trialEndsAt > now) return true;

  return false;
}

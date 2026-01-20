import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ ok: false, allowed: false }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ ok: false, allowed: false }, { status: 404 });
  }

  const now = new Date();
  const hasTrial = user.trialEndsAt && user.trialEndsAt > now;

  const allowed = user.ownerPaid || Boolean(hasTrial);

  return NextResponse.json({
    ok: true,
    allowed,
    ownerPaid: user.ownerPaid,
    trialEndsAt: user.trialEndsAt,
    stripeStatus: user.stripeStatus,
    cancelAtPeriodEnd: user.cancelAtPeriodEnd,
  });
}

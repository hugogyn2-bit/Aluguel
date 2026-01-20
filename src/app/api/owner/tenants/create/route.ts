import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: Request) {
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

  const now = new Date();
  const hasTrial = owner.trialEndsAt && owner.trialEndsAt > now;
  const allowed = owner.ownerPaid || Boolean(hasTrial);

  if (!allowed) {
    return NextResponse.json(
      { error: "❌ Sem acesso (paywall). Ative o Trial ou vire Premium." },
      { status: 403 }
    );
  }

  // ✅ daqui pra baixo continua seu código de criar tenant...
  // const body = await req.json()
  // prisma.tenantProfile.create(...)
}

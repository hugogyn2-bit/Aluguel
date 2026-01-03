import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Aqui você integraria Stripe/Mercado Pago e confirmaria webhooks etc.
  // Para o app ficar funcional agora, marcamos como pago (mock).
  await prisma.user.update({
    where: { id: token.uid as string },
    data: { ownerPaid: true },
  });

  return NextResponse.json({ ok: true });
}

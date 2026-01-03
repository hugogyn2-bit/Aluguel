import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

async function mpFetch(path: string) {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) throw new Error("MERCADOPAGO_ACCESS_TOKEN não configurado");
  const res = await fetch(`https://api.mercadopago.com${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Mercado Pago API ${res.status}: ${t.slice(0, 300)}`);
  }
  return res.json();
}

export async function POST(req: Request) {
  const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: token.uid as string } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  if (user.ownerPaid) return NextResponse.json({ ok: true });

  // Tentativa: buscar assinaturas por e-mail do pagador.
  // Endpoint usado em integrações reais: GET /preapproval/search?payer_email=...
  // Se sua conta/escopo não suportar, a verificação pode falhar — nesse caso, confie no webhook.
  try {
    const data = await mpFetch(`/preapproval/search?payer_email=${encodeURIComponent(user.email)}&sort=date_created&criteria=desc&limit=5`);
    const results = (data?.results ?? data?.preapprovals ?? []) as any[];
    const active = results.find((r) => {
      const s = String(r?.status ?? "").toLowerCase();
      return ["authorized", "active", "approved"].includes(s);
    });
    if (!active) return NextResponse.json({ error: "Not active yet" }, { status: 409 });

    await prisma.user.update({ where: { id: user.id }, data: { ownerPaid: true } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "verify failed" }, { status: 400 });
  }
}

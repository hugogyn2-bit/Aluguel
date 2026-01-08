import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type AnyObj = Record<string, any>;

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

function extractPreapprovalId(payload: AnyObj): string | null {
  // Formatos comuns:
  // { "data": { "id": "..." }, "type": "subscription_preapproval" }
  // { "id": "...", "topic": "preapproval" }
  // { "resource": ".../preapproval/{id}" }
  const id1 = payload?.data?.id;
  if (typeof id1 === "string" && id1.length > 5) return id1;

  const id2 = payload?.id;
  if (typeof id2 === "string" && id2.length > 5) return id2;

  const res = payload?.resource;
  if (typeof res === "string") {
    const m = res.match(/preapproval\/(\w+)/i);
    if (m?.[1]) return m[1];
  }

  return null;
}

export async function POST(req: Request) {
  // Segurança simples por token (recomendado):
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  const expected = process.env.MERCADOPAGO_WEBHOOK_TOKEN;
  if (expected && token !== expected) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const payload = (await req.json().catch(() => ({}))) as AnyObj;

  const preapprovalId = extractPreapprovalId(payload);
  if (!preapprovalId) {
    // Sempre responda 200 para evitar retries infinitos se o evento não for relevante.
    return NextResponse.json({ ok: true, ignored: true });
  }

  try {
    const preapproval = await mpFetch(`/preapproval/${preapprovalId}`);

    const status = String(preapproval?.status ?? "").toLowerCase();
    const payerEmail = String(preapproval?.payer_email ?? preapproval?.payer?.email ?? "").toLowerCase();

    // status varia por conta/fluxo, aceitamos "authorized"/"active"/"approved"
    const isActive = ["authorized", "active", "approved"].includes(status);

    if (isActive && payerEmail) {
      await prisma.user.updateMany({
        where: { email: payerEmail, role: "OWNER" },
        data: { ownerPaid: true },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    // Responde 200 para evitar looping; log de erro pode ir para observabilidade
    return NextResponse.json({ ok: true, error: e?.message ?? "webhook error" });
  }
}

import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export const runtime = "nodejs";

function checkoutUrl() {
  return (
    process.env.MERCADOPAGO_CHECKOUT_URL ||
    // evite NEXT_PUBLIC aqui (server route)
    "https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=a3d9c55a69aa4d69b1345e1f1469d632"
  );
}

// ✅ GET: permite abrir /api/pay/owner/start direto no navegador
export async function GET(req: Request) {
  const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  if (token.role !== "OWNER") {
    return NextResponse.json({ error: "Somente OWNER pode assinar" }, { status: 403 });
  }

  return NextResponse.redirect(checkoutUrl());
}

// ✅ POST: para o PayButton via fetch
export async function POST(req: Request) {
  try {
    const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET });

    if (!token) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    if (token.role !== "OWNER") {
      return NextResponse.json(
        { error: "Somente OWNER pode assinar", reason: `role=${String(token.role)}` },
        { status: 403 }
      );
    }

    return NextResponse.json({ url: checkoutUrl() });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

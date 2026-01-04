import { NextResponse } from "next/server";

function getCheckoutUrl() {
  return (
    process.env.MERCADOPAGO_CHECKOUT_URL ||
    process.env.NEXT_PUBLIC_MERCADOPAGO_CHECKOUT_URL ||
    "https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=a3d9c55a69aa4d69b1345e1f1469d632"
  );
}

// GET: abre direto no browser (útil pra testar)
export async function GET() {
  return NextResponse.redirect(getCheckoutUrl());
}

// POST: usado pelo PayButton via fetch (retorna JSON)
export async function POST() {
  const url = getCheckoutUrl();

  if (!url) {
    return NextResponse.json(
      { error: "Checkout URL não configurada (MERCADOPAGO_CHECKOUT_URL)." },
      { status: 500 }
    );
  }

  return NextResponse.json({ url });
}

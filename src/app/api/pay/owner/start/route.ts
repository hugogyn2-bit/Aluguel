import { NextResponse } from "next/server";

function getCheckoutUrl() {
  return (
    process.env.MERCADOPAGO_CHECKOUT_URL ||
    process.env.NEXT_PUBLIC_MERCADOPAGO_CHECKOUT_URL ||
    "https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=a3d9c55a69aa4d69b1345e1f1469d632"
  );
}

// Navegar direto no browser (ex: window.location = "/api/pay/owner/start")
export async function GET() {
  return NextResponse.redirect(getCheckoutUrl());
}

// Usar via fetch (ex: fetch("/api/pay/owner/start", { method: "POST" }))
export async function POST() {
  return NextResponse.json({ url: getCheckoutUrl() });
}

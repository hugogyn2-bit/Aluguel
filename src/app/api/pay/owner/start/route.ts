import { NextResponse } from "next/server";

export async function POST() {
  const url =
    process.env.MERCADOPAGO_CHECKOUT_URL ||
    process.env.NEXT_PUBLIC_MERCADOPAGO_CHECKOUT_URL ||
    "https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=a3d9c55a69aa4d69b1345e1f1469d632";

  return NextResponse.json({ url });
}

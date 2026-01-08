import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export const runtime = "nodejs";

function getCheckoutUrl() {
  return (
    process.env.MERCADOPAGO_CHECKOUT_URL ||
    process.env.NEXT_PUBLIC_MERCADOPAGO_CHECKOUT_URL ||
    "https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=a3d9c55a69aa4d69b1345e1f1469d632"
  );
}

export async function POST(req: Request) {
  const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (token.role !== "OWNER") return NextResponse.json({ error: "Apenas proprietário" }, { status: 403 });

  return NextResponse.json({ url: getCheckoutUrl() });
}

export async function GET(req: Request) {
  const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.redirect(new URL("/auth/sign-in", req.url));
  if (token.role !== "OWNER") return NextResponse.redirect(new URL("/tenant", req.url));

  return NextResponse.redirect(getCheckoutUrl());
}

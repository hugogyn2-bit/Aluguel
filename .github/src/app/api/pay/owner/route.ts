import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET });

  if (!token) return NextResponse.redirect(new URL("/auth/sign-in", req.url));
  if (token.role !== "OWNER") return NextResponse.redirect(new URL("/tenant", req.url));

  const url =
    process.env.MERCADOPAGO_CHECKOUT_URL ||
    process.env.NEXT_PUBLIC_MERCADOPAGO_CHECKOUT_URL ||
    "https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=a3d9c55a69aa4d69b1345e1f1469d632";

  return NextResponse.redirect(url);
}

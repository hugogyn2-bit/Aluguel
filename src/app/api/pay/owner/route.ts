import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function POST(req: Request) {
  try {
    // 🔐 garante que o usuário está logado (OWNER)
    const token = await getToken({
      req: req as any,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      );
    }

    if (token.role !== "OWNER") {
      return NextResponse.json(
        { error: "Apenas proprietário pode assinar o plano" },
        { status: 403 }
      );
    }

    // 🔗 URL do checkout (Mercado Pago)
    const checkoutUrl =
      process.env.MERCADOPAGO_CHECKOUT_URL ||
      process.env.NEXT_PUBLIC_MERCADOPAGO_CHECKOUT_URL ||
      "https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=a3d9c55a69aa4d69b1345e1f1469d632";

    return NextResponse.json({ url: checkoutUrl });
  } catch (err) {
    console.error("Erro /api/pay/owner:", err);
    return NextResponse.json(
      { error: "Erro interno ao iniciar pagamento" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { id } = await context.params;

    const body = await req.json().catch(() => null);
    const signatureBase64 = body?.signatureBase64;

    if (!signatureBase64 || typeof signatureBase64 !== "string") {
      return NextResponse.json({ error: "Assinatura inválida" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    if (user.role !== "OWNER") {
      return NextResponse.json(
        { error: "Apenas OWNER pode assinar como locador" },
        { status: 403 }
      );
    }

    const contract = await prisma.rentalContract.findUnique({
      where: { id },
    });

    if (!contract) {
      return NextResponse.json({ error: "Contrato não encontrado" }, { status: 404 });
    }

    if (contract.ownerId !== user.id) {
      return NextResponse.json(
        { error: "Você não tem permissão para assinar este contrato" },
        { status: 403 }
      );
    }

    // ✅ salva assinatura do locador
    const updated = await prisma.rentalContract.update({
      where: { id },
      data: {
        ownerSignatureDataUrl: signatureBase64,
        ownerSignedAt: new Date(),
      },
    });

    return NextResponse.json({
      message: "Locador assinou com sucesso ✅",
      contract: updated,
    });
  } catch (err: any) {
    console.error("❌ owner-sign error:", err?.message || err);

    return NextResponse.json(
      { error: "Erro interno ao assinar contrato (locador)" },
      { status: 500 }
    );
  }
}

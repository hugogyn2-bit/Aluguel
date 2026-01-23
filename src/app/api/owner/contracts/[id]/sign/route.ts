import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    if (user.role !== "OWNER") {
      return NextResponse.json({ error: "Apenas OWNER pode assinar" }, { status: 403 });
    }

    const contract = await prisma.rentalContract.findUnique({
      where: { id },
    });

    if (!contract) {
      return NextResponse.json({ error: "Contrato não encontrado" }, { status: 404 });
    }

    // ✅ segurança: só o dono do contrato pode assinar
    if (contract.ownerId !== user.id) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    // ✅ pega assinatura desenhada (base64) do body
    const body = await req.json().catch(() => null);
    const signatureDataUrl = body?.signatureDataUrl;

    if (!signatureDataUrl || typeof signatureDataUrl !== "string") {
      return NextResponse.json(
        { error: "Assinatura obrigatória (signatureDataUrl)" },
        { status: 400 }
      );
    }

    await prisma.rentalContract.update({
      where: { id },
      data: {
        ownerSignatureDataUrl: signatureDataUrl,
        ownerSignedAt: new Date(),
      },
    });

    return NextResponse.json({ message: "Contrato assinado pelo locador ✅" });
  } catch (err: any) {
    console.error("❌ Erro ao assinar contrato (owner):", err?.message || err);

    return NextResponse.json(
      { error: "Erro interno ao assinar" },
      { status: 500 }
    );
  }
}

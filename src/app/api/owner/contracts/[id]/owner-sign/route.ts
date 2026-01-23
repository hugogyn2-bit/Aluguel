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
    const { id } = await context.params;

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    if (user.role !== "OWNER") {
      return NextResponse.json({ error: "Apenas OWNER pode assinar" }, { status: 403 });
    }

    const body = await req.json().catch(() => null);
    const signatureDataUrl = body?.signatureDataUrl;

    if (!signatureDataUrl || typeof signatureDataUrl !== "string") {
      return NextResponse.json({ error: "Assinatura inválida" }, { status: 400 });
    }

    const contract = await prisma.rentalContract.findUnique({
      where: { id },
      select: { id: true, ownerId: true },
    });

    if (!contract) {
      return NextResponse.json({ error: "Contrato não encontrado" }, { status: 404 });
    }

    if (contract.ownerId !== user.id) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    const updated = await prisma.rentalContract.update({
      where: { id },
      data: {
        ownerSignatureDataUrl: signatureDataUrl,
        ownerSignedAt: new Date(),
        status: "PENDING_SIGNATURES",
      },
    });

    return NextResponse.json({
      message: "Assinatura do LOCADOR salva com sucesso",
      contract: updated,
    });
  } catch (err: any) {
    console.error("❌ Erro ao assinar (OWNER):", err?.message || err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

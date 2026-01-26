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

    const owner = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!owner || owner.role !== "OWNER") {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    const body = await req.json();
    const { signatureDataUrl } = body;

    if (!signatureDataUrl || typeof signatureDataUrl !== "string") {
      return NextResponse.json({ error: "Assinatura inválida" }, { status: 400 });
    }

    const contract = await prisma.rentalContract.findUnique({
      where: { id },
    });

    if (!contract) {
      return NextResponse.json({ error: "Contrato não encontrado" }, { status: 404 });
    }

    // ✅ segurança: só pode assinar se for dono do contrato
    if (contract.ownerId !== owner.id) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    const updated = await prisma.rentalContract.update({
      where: { id },
      data: {
        ownerSignatureDataUrl: signatureDataUrl,
        ownerSignedAt: new Date(),
        status: contract.tenantSignedAt ? "ACTIVE" : "PENDING_SIGNATURES",
      },
    });

    return NextResponse.json({
      message: "✅ Contrato assinado pelo proprietário com sucesso!",
      contract: updated,
    });
  } catch (err) {
    console.error("Erro ao assinar como owner:", err);
    return NextResponse.json(
      { error: "Erro interno ao assinar" },
      { status: 500 }
    );
  }
}

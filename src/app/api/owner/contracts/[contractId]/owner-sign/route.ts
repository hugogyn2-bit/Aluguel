import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(
  req: Request,
  { params }: { params: { contractId: string } }
) {
  try {
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
    const signatureDataUrl = body?.signatureDataUrl;

    if (!signatureDataUrl || !String(signatureDataUrl).startsWith("data:image")) {
      return NextResponse.json(
        { error: "Assinatura inválida (envie um dataURL da imagem)." },
        { status: 400 }
      );
    }

    const contract = await prisma.rentalContract.findUnique({
      where: { id: params.contractId },
    });

    if (!contract) {
      return NextResponse.json({ error: "Contrato não encontrado" }, { status: 404 });
    }

    if (contract.ownerId !== owner.id) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    // ✅ salva assinatura do locador
    const updated = await prisma.rentalContract.update({
      where: { id: contract.id },
      data: {
        ownerSignatureDataUrl: signatureDataUrl,
        ownerSignedAt: new Date(),
      },
    });

    return NextResponse.json({
      message: "✅ Assinatura do LOCADOR registrada com sucesso!",
      contract: updated,
    });
  } catch (err: any) {
    console.error("❌ Erro owner-sign:", err?.message || err);

    return NextResponse.json(
      { error: "Erro interno ao assinar contrato (OWNER)" },
      { status: 500 }
    );
  }
}

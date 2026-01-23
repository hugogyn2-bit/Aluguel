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

    const contract = await prisma.rentalContract.findUnique({
      where: { id: params.contractId },
    });

    if (!contract) {
      return NextResponse.json({ error: "Contrato não encontrado" }, { status: 404 });
    }

    if (contract.ownerId !== owner.id) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    if (!contract.ownerSignatureDataUrl || !contract.tenantSignatureDataUrl) {
      return NextResponse.json(
        { error: "O contrato só pode ser ativado quando ambos assinarem." },
        { status: 400 }
      );
    }

    const updated = await prisma.rentalContract.update({
      where: { id: contract.id },
      data: {
        status: "ACTIVE",
      },
    });

    return NextResponse.json({
      message: "✅ Contrato ATIVADO com sucesso!",
      contract: updated,
    });
  } catch (err: any) {
    console.error("❌ Erro activate-contract:", err?.message || err);
    return NextResponse.json(
      { error: "Erro interno ao ativar contrato" },
      { status: 500 }
    );
  }
}

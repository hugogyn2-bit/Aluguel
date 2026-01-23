import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ contractId: string }> }
) {
  try {
    const { contractId } = await params;

    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const owner = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!owner) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    if (owner.role !== "OWNER") {
      return NextResponse.json({ error: "Apenas OWNER" }, { status: 403 });
    }

    const contract = await prisma.rentalContract.findUnique({
      where: { id: contractId },
      include: {
        tenant: {
          include: {
            user: true,
          },
        },
        owner: true,
      },
    });

    if (!contract) {
      return NextResponse.json({ error: "Contrato não encontrado" }, { status: 404 });
    }

    if (contract.ownerId !== owner.id) {
      return NextResponse.json({ error: "Esse contrato não é seu" }, { status: 403 });
    }

    return NextResponse.json({ contract });
  } catch (err: any) {
    console.error("❌ Erro ao buscar contrato:", err?.message || err);
    return NextResponse.json(
      { error: "Erro interno ao buscar contrato" },
      { status: 500 }
    );
  }
}

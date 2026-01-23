import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(
  _req: Request,
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
      return NextResponse.json({ error: "Apenas OWNER pode ativar" }, { status: 403 });
    }

    const contract = await prisma.rentalContract.findUnique({
      where: { id },
      select: {
        id: true,
        ownerId: true,
        ownerSignedAt: true,
        tenantSignedAt: true,
        status: true,
      },
    });

    if (!contract) {
      return NextResponse.json({ error: "Contrato não encontrado" }, { status: 404 });
    }

    if (contract.ownerId !== user.id) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    // ✅ só ativa se assinaturas existirem
    if (!contract.ownerSignedAt || !contract.tenantSignedAt) {
      return NextResponse.json(
        { error: "Contrato precisa estar assinado por LOCADOR e LOCATÁRIO" },
        { status: 400 }
      );
    }

    const updated = await prisma.rentalContract.update({
      where: { id },
      data: { status: "ACTIVE" },
    });

    return NextResponse.json({
      message: "Contrato ativado com sucesso",
      contract: updated,
    });
  } catch (err: any) {
    console.error("❌ Erro activate contrato:", err?.message || err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

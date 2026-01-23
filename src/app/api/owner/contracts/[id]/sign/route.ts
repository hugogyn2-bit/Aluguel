import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
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
      return NextResponse.json(
        { error: "Apenas OWNER pode assinar aqui" },
        { status: 403 }
      );
    }

    const contractId = params.id;

    const body = await req.json();
    const signatureDataUrl = body?.signatureDataUrl;

    if (!signatureDataUrl || typeof signatureDataUrl !== "string") {
      return NextResponse.json(
        { error: "Assinatura inválida" },
        { status: 400 }
      );
    }

    // ✅ pega o contrato e valida se pertence ao OWNER logado
    const contract = await prisma.rentalContract.findUnique({
      where: { id: contractId },
    });

    if (!contract) {
      return NextResponse.json({ error: "Contrato não encontrado" }, { status: 404 });
    }

    if (contract.ownerId !== owner.id) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    // ✅ não deixa assinar duas vezes
    if (contract.ownerSignedAt) {
      return NextResponse.json(
        { error: "Locador já assinou este contrato" },
        { status: 400 }
      );
    }

    // ✅ salva assinatura do OWNER
    await prisma.rentalContract.update({
      where: { id: contractId },
      data: {
        ownerSignatureDataUrl: signatureDataUrl,
        ownerSignedAt: new Date(),
      },
    });

    return NextResponse.json({
      message: "✅ Assinatura do locador registrada com sucesso!",
    });
  } catch (err: any) {
    console.error("❌ Erro ao assinar contrato como locador:", err?.message || err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

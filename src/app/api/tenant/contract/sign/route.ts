import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const tenantUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { tenantProfile: true },
    });

    if (!tenantUser) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    if (tenantUser.role !== "TENANT") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    if (!tenantUser.tenantProfile) {
      return NextResponse.json(
        { error: "Perfil de inquilino não encontrado" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const signatureDataUrl = body?.signatureDataUrl;

    if (!signatureDataUrl || typeof signatureDataUrl !== "string") {
      return NextResponse.json({ error: "Assinatura inválida" }, { status: 400 });
    }

    // pega o contrato desse tenant
    const contract = await prisma.rentalContract.findFirst({
      where: {
        tenantProfileId: tenantUser.tenantProfile.id,
      },
      orderBy: { createdAt: "desc" },
    });

    if (!contract) {
      return NextResponse.json({ error: "Contrato não encontrado" }, { status: 404 });
    }

    // ✅ atualiza tenant signature
    const updated = await prisma.rentalContract.update({
      where: { id: contract.id },
      data: {
        tenantSignatureDataUrl: signatureDataUrl,
        tenantSignedAt: new Date(),
        status: contract.ownerSignedAt ? "ACTIVE" : "PENDING_SIGNATURES",
      },
    });

    return NextResponse.json({
      message: "✅ Contrato assinado pelo inquilino!",
      contract: updated,
    });
  } catch (err) {
    console.error("❌ Erro ao assinar contrato (tenant):", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

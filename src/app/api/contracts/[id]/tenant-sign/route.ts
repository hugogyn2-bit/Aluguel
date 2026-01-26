import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;

    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { tenantProfile: true },
    });

    if (!user || user.role !== "TENANT") {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    if (!user.tenantProfile) {
      return NextResponse.json({ error: "Perfil do inquilino não encontrado" }, { status: 404 });
    }

    const body = await req.json();
    const signatureDataUrl = String(body?.signatureDataUrl || "");

    if (!signatureDataUrl || !signatureDataUrl.startsWith("data:image/")) {
      return NextResponse.json(
        { error: "Assinatura inválida (envie signatureDataUrl)" },
        { status: 400 }
      );
    }

    const contract = await prisma.rentalContract.findUnique({
      where: { id },
    });

    if (!contract) {
      return NextResponse.json({ error: "Contrato não encontrado" }, { status: 404 });
    }

    // ✅ segurança: contrato tem que ser do tenant logado
    if (contract.tenantProfileId !== user.tenantProfile.id) {
      return NextResponse.json(
        { error: "Esse contrato não pertence ao seu usuário" },
        { status: 403 }
      );
    }

    const updated = await prisma.rentalContract.update({
      where: { id },
      data: {
        tenantSignatureDataUrl: signatureDataUrl,
        tenantSignedAt: new Date(),
        status: contract.ownerSignedAt ? "ACTIVE" : "PENDING_SIGNATURES",
      },
    });

    return NextResponse.json({
      message: "✅ Assinatura do inquilino registrada!",
      contract: updated,
    });
  } catch (err) {
    console.error("Erro tenant-sign:", err);
    return NextResponse.json({ error: "Erro interno ao assinar" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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
      return NextResponse.json({ error: "Apenas TENANT pode assinar aqui" }, { status: 403 });
    }

    if (!tenantUser.tenantProfile) {
      return NextResponse.json({ error: "Perfil de tenant não encontrado" }, { status: 404 });
    }

    const body = await req.json();
    const signatureDataUrl = body?.signatureDataUrl;

    if (!signatureDataUrl || typeof signatureDataUrl !== "string") {
      return NextResponse.json({ error: "Assinatura inválida" }, { status: 400 });
    }

    const contract = await prisma.rentalContract.findUnique({
      where: { id },
    });

    if (!contract) {
      return NextResponse.json({ error: "Contrato não encontrado" }, { status: 404 });
    }

    // ✅ SEGURANÇA:
    // esse contrato precisa ser do tenant logado
    if (contract.tenantId !== tenantUser.tenantProfile.id) {
      return NextResponse.json(
        { error: "Esse contrato não pertence ao seu usuário" },
        { status: 403 }
      );
    }

    const updated = await prisma.rentalContract.update({
      where: { id },
      data: {
        tenantSignature: signatureDataUrl,
        tenantSignedAt: new Date(),
      },
    });

    return NextResponse.json({
      message: "Assinatura do inquilino registrada ✅",
      contract: updated,
    });
  } catch (err: any) {
    console.error("❌ Erro ao assinar (tenant):", err?.message || err);

    return NextResponse.json(
      { error: "Erro interno ao assinar" },
      { status: 500 }
    );
  }
}

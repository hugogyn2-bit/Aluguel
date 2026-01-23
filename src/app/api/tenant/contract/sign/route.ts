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
      include: {
        tenantProfile: true,
      },
    });

    if (!tenantUser || tenantUser.role !== "TENANT") {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    if (!tenantUser.tenantProfile) {
      return NextResponse.json(
        { error: "Perfil do inquilino não encontrado." },
        { status: 404 }
      );
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
      where: { tenantProfileId: tenantUser.tenantProfile.id },
    });

    if (!contract) {
      return NextResponse.json(
        { error: "Contrato não encontrado." },
        { status: 404 }
      );
    }

    // ✅ salva assinatura do tenant
    const updated = await prisma.rentalContract.update({
      where: { id: contract.id },
      data: {
        tenantSignatureDataUrl: signatureDataUrl,
        tenantSignedAt: new Date(),
      },
    });

    return NextResponse.json({
      message: "✅ Assinatura do LOCATÁRIO registrada com sucesso!",
      contract: updated,
    });
  } catch (err: any) {
    console.error("❌ Erro tenant-sign:", err?.message || err);
    return NextResponse.json(
      { error: "Erro interno ao assinar contrato (TENANT)" },
      { status: 500 }
    );
  }
}

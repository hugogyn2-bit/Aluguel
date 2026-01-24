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
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const userId = session.user.id;
    const { id } = await context.params;

    const body = await req.json();
    const signatureDataUrl = body?.signatureDataUrl as string | undefined;

    if (!signatureDataUrl || typeof signatureDataUrl !== "string") {
      return NextResponse.json(
        { error: "Assinatura inválida" },
        { status: 400 }
      );
    }

    // ✅ pega o usuário e o tenantProfile dele
    const tenantUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { tenantProfile: true },
    });

    if (!tenantUser || tenantUser.role !== "TENANT") {
      return NextResponse.json(
        { error: "Apenas TENANT pode assinar aqui" },
        { status: 403 }
      );
    }

    if (!tenantUser.tenantProfile) {
      return NextResponse.json(
        { error: "TenantProfile não encontrado" },
        { status: 404 }
      );
    }

    const contract = await prisma.rentalContract.findUnique({
      where: { id },
    });

    if (!contract) {
      return NextResponse.json(
        { error: "Contrato não encontrado" },
        { status: 404 }
      );
    }

    // ✅ SEGURANÇA:
    // esse contrato precisa ser do tenant logado
    if (contract.tenantProfileId !== tenantUser.tenantProfile.id) {
      return NextResponse.json(
        { error: "Esse contrato não pertence ao seu usuário" },
        { status: 403 }
      );
    }

    // ✅ salva assinatura do tenant
    await prisma.rentalContract.update({
      where: { id },
      data: {
        tenantSignatureDataUrl: signatureDataUrl,
        tenantSignedAt: new Date(),
        status:
          contract.ownerSignedAt && contract.ownerSignatureDataUrl
            ? "ACTIVE"
            : "PENDING_SIGNATURES",
      },
    });

    return NextResponse.json({ message: "Contrato assinado pelo inquilino ✅" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

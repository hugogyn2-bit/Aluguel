import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        tenantProfile: true,
      },
    });

    if (!user || user.role !== "TENANT") {
      return NextResponse.json({ error: "Apenas TENANT pode assinar aqui" }, { status: 403 });
    }

    if (!user.tenantProfile) {
      return NextResponse.json({ error: "TenantProfile não encontrado" }, { status: 404 });
    }

    const body = await req.json();
    const signatureDataUrl = body?.signatureDataUrl as string;

    if (!signatureDataUrl || !signatureDataUrl.startsWith("data:image/png;base64,")) {
      return NextResponse.json({ error: "Assinatura inválida" }, { status: 400 });
    }

    const contract = await prisma.rentalContract.findUnique({
      where: { id: params.id },
    });

    if (!contract) {
      return NextResponse.json({ error: "Contrato não encontrado" }, { status: 404 });
    }

    // ✅ tenant só assina contrato dele
    if (contract.tenantProfileId !== user.tenantProfile.id) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    // ✅ tenant só assina se owner já assinou
    if (contract.status !== "OWNER_SIGNED") {
      return NextResponse.json({ error: "Contrato ainda não foi assinado pelo locador" }, { status: 400 });
    }

    const updated = await prisma.rentalContract.update({
      where: { id: params.id },
      data: {
        tenantSignatureDataUrl: signatureDataUrl,
        tenantSignedAt: new Date(),
        status: "TENANT_SIGNED",
      },
    });

    return NextResponse.json({ message: "Tenant assinou ✅", contract: updated });
  } catch (err: any) {
    console.error("❌ Erro tenant-sign:", err?.message || err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
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

    const contract = await prisma.rentalContract.findUnique({
      where: { tenantProfileId: tenantUser.tenantProfile.id },
      include: { tenantProfile: true },
    });

    if (!contract) {
      return NextResponse.json(
        { error: "Contrato não encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json({ contract });
  } catch (err: any) {
    console.error("❌ Erro ao buscar contrato tenant:", err?.message || err);
    return NextResponse.json(
      { error: "Erro interno ao buscar contrato" },
      { status: 500 }
    );
  }
}

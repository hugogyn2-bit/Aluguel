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

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { tenantProfile: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    if (user.role !== "TENANT") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    if (!user.tenantProfile) {
      return NextResponse.json({ error: "Perfil de inquilino não encontrado" }, { status: 404 });
    }

    const contract = await prisma.rentalContract.findFirst({
      where: {
        tenantProfileId: user.tenantProfile.id,
      },
      orderBy: { createdAt: "desc" },
      include: {
        tenantProfile: {
          include: {
            owner: {
              select: { id: true, name: true, email: true },
            },
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    if (!contract) {
      return NextResponse.json({ error: "Nenhum contrato encontrado" }, { status: 404 });
    }

    return NextResponse.json({
      contract,
    });
  } catch (err) {
    console.error("❌ Erro ao buscar contrato do tenant:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

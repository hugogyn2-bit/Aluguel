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

    const owner = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!owner) {
      return NextResponse.json({ error: "Owner não encontrado" }, { status: 404 });
    }

    if (owner.role !== "OWNER") {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    const tenants = await prisma.tenantProfile.findMany({
      where: { ownerId: owner.id },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            mustChangePassword: true,
            createdAt: true,
          },
        },
      },
    });

    return NextResponse.json({ tenants });
  } catch (err: any) {
    console.error("❌ Erro ao listar tenants:", err?.message || err);

    return NextResponse.json(
      { error: "Erro interno ao listar inquilinos" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { id } = await context.params;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        tenantProfile: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const contract = await prisma.rentalContract.findUnique({
      where: { id },
      include: {
        tenant: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!contract) {
      return NextResponse.json({ error: "Contrato não encontrado" }, { status: 404 });
    }

    // ✅ regra de permissão
    const isOwnerAllowed = user.role === "OWNER" && contract.ownerId === user.id;

    const isTenantAllowed =
      user.role === "TENANT" &&
      user.tenantProfile &&
      contract.tenantId === user.tenantProfile.id;

    if (!isOwnerAllowed && !isTenantAllowed) {
      return NextResponse.json(
        { error: "Sem permissão para acessar este contrato" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      contract,
    });
  } catch (err: any) {
    console.error("❌ GET contract error:", err?.message || err);

    return NextResponse.json(
      { error: "Erro interno ao buscar contrato" },
      { status: 500 }
    );
  }
}

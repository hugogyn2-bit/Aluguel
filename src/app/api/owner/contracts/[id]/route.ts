import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    if (user.role !== "OWNER") {
      return NextResponse.json({ error: "Apenas OWNER pode acessar" }, { status: 403 });
    }

    const contract = await prisma.rentalContract.findUnique({
      where: { id },
      include: {
        tenantProfile: {
          include: {
            user: { select: { email: true, id: true } },
          },
        },
      },
    });

    if (!contract) {
      return NextResponse.json({ error: "Contrato não encontrado" }, { status: 404 });
    }

    // ✅ segurança: só o owner dono do contrato pode ver
    if (contract.ownerId !== user.id) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    return NextResponse.json({ contract });
  } catch (err: any) {
    console.error("❌ Erro GET contrato owner:", err?.message || err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

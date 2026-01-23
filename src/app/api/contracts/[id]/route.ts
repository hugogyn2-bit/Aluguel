import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(req: Request, { params }: { params: { id: string } }) {
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

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const contract = await prisma.rentalContract.findUnique({
      where: { id: params.id },
      include: {
        tenantProfile: true,
      },
    });

    if (!contract) {
      return NextResponse.json({ error: "Contrato não encontrado" }, { status: 404 });
    }

    // ✅ OWNER pode ver contratos dele
    if (user.role === "OWNER") {
      if (contract.ownerId !== user.id) {
        return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
      }
    }

    // ✅ TENANT pode ver contrato dele
    if (user.role === "TENANT") {
      if (!user.tenantProfile || contract.tenantProfileId !== user.tenantProfile.id) {
        return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
      }
    }

    return NextResponse.json({ contract });
  } catch (err: any) {
    console.error("❌ Erro ao buscar contrato:", err?.message || err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

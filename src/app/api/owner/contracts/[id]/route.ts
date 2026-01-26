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

    const owner = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!owner || owner.role !== "OWNER") {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    const contract = await prisma.rentalContract.findUnique({
      where: { id },
      include: {
        tenantProfile: true,
        owner: { select: { id: true, name: true, email: true } },
      },
    });

    if (!contract) {
      return NextResponse.json({ error: "Contrato não encontrado" }, { status: 404 });
    }

    // ✅ garante que o contrato é do dono logado
    if (contract.ownerId !== owner.id) {
      return NextResponse.json({ error: "Sem permissão nesse contrato" }, { status: 403 });
    }

    return NextResponse.json({ contract });
  } catch (err) {
    console.error("Erro GET owner contract:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

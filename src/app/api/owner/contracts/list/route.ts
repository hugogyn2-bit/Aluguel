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

    if (!owner || owner.role !== "OWNER") {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    const contracts = await prisma.rentalContract.findMany({
      where: { ownerId: owner.id },
      orderBy: { createdAt: "desc" },
      include: {
        tenantProfile: {
          select: {
            id: true,
            fullName: true,
            cpf: true,
            rg: true,
            email: true,
            phone: true,
            city: true,
            address: true,
            cep: true,
            rentValueCents: true,
            createdAt: true,
          },
        },
      },
    });

    return NextResponse.json({ contracts });
  } catch (err) {
    console.error("Erro listando contratos (owner):", err);
    return NextResponse.json(
      { error: "Erro interno ao listar contratos" },
      { status: 500 }
    );
  }
}

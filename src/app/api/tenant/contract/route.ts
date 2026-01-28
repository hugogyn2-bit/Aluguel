import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const tenant = await prisma.tenantProfile.findFirst({
      where: {
        user: { email: session.user.email },
      },
      include: {
        contracts: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!tenant || tenant.contracts.length === 0) {
      return NextResponse.json({ error: "Contrato não encontrado" }, { status: 404 });
    }

    return NextResponse.json({ contract: tenant.contracts[0] });
  } catch (err) {
    console.error("Tenant contract:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

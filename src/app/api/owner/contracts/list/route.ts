import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
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
    include: {
      tenantProfile: {
        select: {
          id: true,
          fullName: true,
          cpf: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ contracts });
}

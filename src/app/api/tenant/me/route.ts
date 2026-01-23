import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const me = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      email: true,
      name: true,
      role: true,
      tenantProfile: {
        select: {
          fullName: true,
          cpf: true,
          rg: true,
          address: true,
          cep: true,
          phone: true,
        },
      },
    },
  });

  if (!me) {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  }

  if (me.role !== "TENANT") {
    return NextResponse.json({ error: "Apenas TENANT" }, { status: 403 });
  }

  return NextResponse.json({ me });
}

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

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      tenantProfile: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  }

  if (user.role !== "TENANT") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  if (!user.tenantProfile) {
    return NextResponse.json(
      { error: "TenantProfile não encontrado" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    fullName: user.tenantProfile.fullName,
    cpf: user.tenantProfile.cpf,
    rg: user.tenantProfile.rg,
    address: user.tenantProfile.address,
    cep: user.tenantProfile.cep,
    birthDate: user.birthDate ? user.birthDate.toISOString().slice(0, 10) : null,
  });
}

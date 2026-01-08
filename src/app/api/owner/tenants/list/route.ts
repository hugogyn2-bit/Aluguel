import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    if (token.role !== "OWNER") return NextResponse.json({ error: "Apenas proprietário" }, { status: 403 });

    const ownerId = String(token.id);

    const tenants = await prisma.tenantProfile.findMany({
      where: { ownerId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        fullName: true,
        cpf: true,
        rg: true,
        address: true,
        cep: true,
        createdAt: true,
        user: { select: { email: true } },
      },
    });

    return NextResponse.json({
      tenants: tenants.map((t: any) => ({
        id: t.id,
        email: t.user.email,
        fullName: t.fullName,
        cpf: t.cpf,
        rg: t.rg,
        address: t.address,
        cep: t.cep,
        createdAt: t.createdAt,
      })),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

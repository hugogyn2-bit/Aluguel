import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET });

  if (!token) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (token.role !== "OWNER") return NextResponse.json({ error: "Somente OWNER" }, { status: 403 });

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
      user: { select: { id: true, email: true, name: true } },
    },
  });

  return NextResponse.json({ tenants });
}

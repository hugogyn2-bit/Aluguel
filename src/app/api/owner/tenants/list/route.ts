import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET });

    if (!token) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    if (token.role !== "OWNER") return NextResponse.json({ error: "Somente OWNER" }, { status: 403 });

    const ownerId = String(token.id);

    const tenants = await prisma.user.findMany({
      where: { role: "TENANT", ownerId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ ok: true, tenants });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

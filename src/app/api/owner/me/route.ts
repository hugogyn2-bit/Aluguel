import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      );
    }

    const owner = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        email: true,
        premiumActive: true,
        trialEndsAt: true,
        createdAt: true,
      },
    });

    if (!owner) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    if (owner.role !== "OWNER") {
      return NextResponse.json(
        { error: "Acesso negado" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      id: owner.id,
      name: owner.name,
      email: owner.email,
      premiumActive: owner.premiumActive,
      trialEndsAt: owner.trialEndsAt,
      createdAt: owner.createdAt,
    });
  } catch (err) {
    console.error("❌ Erro ao buscar owner/me:", err);
    return NextResponse.json(
      { error: "Erro interno" },
      { status: 500 }
    );
  }
}

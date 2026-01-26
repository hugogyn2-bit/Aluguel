import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;

    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { tenantProfile: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    // ✅ pega contrato + dono + tenant (perfil)
    const contract = await prisma.rentalContract.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
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
            user: {
              select: { id: true, email: true, name: true, role: true },
            },
          },
        },
      },
    });

    if (!contract) {
      return NextResponse.json({ error: "Contrato não encontrado" }, { status: 404 });
    }

    // ✅ permissão:
    const isOwnerAllowed = user.role === "OWNER" && contract.ownerId === user.id;
    const isTenantAllowed =
      user.role === "TENANT" && contract.tenantProfileId === user.tenantProfile?.id;

    if (!isOwnerAllowed && !isTenantAllowed) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    return NextResponse.json({
      contract: {
        id: contract.id,
        status: contract.status,
        contractText: contract.contractText,
        signedCity: contract.signedCity,
        signedAtDate: contract.signedAtDate,
        rentValueCents: contract.rentValueCents,

        ownerId: contract.ownerId,
        ownerSignatureDataUrl: contract.ownerSignatureDataUrl,
        ownerSignedAt: contract.ownerSignedAt,

        tenantProfileId: contract.tenantProfileId,
        tenantSignatureDataUrl: contract.tenantSignatureDataUrl,
        tenantSignedAt: contract.tenantSignedAt,

        createdAt: contract.createdAt,
        updatedAt: contract.updatedAt,

        owner: contract.owner,
        tenantProfile: contract.tenantProfile,
      },
    });
  } catch (err) {
    console.error("Erro GET contrato:", err);
    return NextResponse.json({ error: "Erro interno ao buscar contrato" }, { status: 500 });
  }
}

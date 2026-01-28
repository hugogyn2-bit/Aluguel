import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
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

    const contract = await prisma.rentalContract.findUnique({
      where: { id: params.id },
    });

    if (!contract) {
      return NextResponse.json({ error: "Contrato não encontrado" }, { status: 404 });
    }

    const signedText =
      contract.contractText +
      `\n\nASSINADO DIGITALMENTE PELO LOCADOR\n${owner.name}\nData: ${new Date().toLocaleDateString("pt-BR")}`;

    await prisma.rentalContract.update({
      where: { id: contract.id },
      data: {
        ownerSignedAt: new Date(),
        status:
          contract.tenantSignedAt ? "SIGNED" : "PENDING_TENANT",
        contractText: signedText,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Owner sign:", err);
    return NextResponse.json({ error: "Erro interno ao assinar" }, { status: 500 });
  }
}

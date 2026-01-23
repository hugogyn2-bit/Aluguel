import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PDFDocument, StandardFonts } from "pdf-lib";

export const runtime = "nodejs";

export async function GET(_req: NextRequest) {
  try {
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
      return NextResponse.json({ error: "Apenas TENANT" }, { status: 403 });
    }

    if (!user.tenantProfile) {
      return NextResponse.json(
        { error: "Perfil do inquilino não encontrado" },
        { status: 404 }
      );
    }

    // ✅ pega o contrato ativo do tenant
    const contract = await prisma.rentalContract.findFirst({
      where: {
        tenantId: user.tenantProfile.id,
        status: "ACTIVE",
      },
      include: {
        owner: true,
        tenant: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!contract) {
      return NextResponse.json(
        { error: "Nenhum contrato ativo encontrado" },
        { status: 404 }
      );
    }

    // ✅ gera PDF simples
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    page.drawText("CONTRATO DE LOCAÇÃO", {
      x: 180,
      y: 800,
      size: 16,
      font: fontBold,
    });

    page.drawText(`Contrato ID: ${contract.id}`, {
      x: 50,
      y: 770,
      size: 10,
      font,
    });

    page.drawText(`Locador: ${contract.owner.name ?? contract.owner.email}`, {
      x: 50,
      y: 740,
      size: 12,
      font,
    });

    page.drawText(`Inquilino: ${contract.tenant.fullName}`, {
      x: 50,
      y: 720,
      size: 12,
      font,
    });

    page.drawText(`E-mail: ${contract.tenant.email}`, {
      x: 50,
      y: 700,
      size: 12,
      font,
    });

    page.drawText(`CPF: ${contract.tenant.cpf}`, {
      x: 50,
      y: 680,
      size: 12,
      font,
    });

    page.drawText(`RG: ${contract.tenant.rg}`, {
      x: 50,
      y: 660,
      size: 12,
      font,
    });

    page.drawText(`Telefone: ${contract.tenant.phone}`, {
      x: 50,
      y: 640,
      size: 12,
      font,
    });

    page.drawText(`Endereço: ${contract.tenant.address}`, {
      x: 50,
      y: 620,
      size: 12,
      font,
    });

    page.drawText(`CEP: ${contract.tenant.cep}`, {
      x: 50,
      y: 600,
      size: 12,
      font,
    });

    page.drawText(`Cidade: ${contract.tenant.city}`, {
      x: 50,
      y: 580,
      size: 12,
      font,
    });

    page.drawText(
      `Valor do aluguel: R$ ${(contract.rentValueCents / 100).toFixed(2)}`,
      {
        x: 50,
        y: 560,
        size: 12,
        font,
      }
    );

    page.drawText(
      `Assinado pelo locador: ${contract.ownerSignedAt ? "SIM" : "NÃO"}`,
      { x: 50, y: 530, size: 12, font }
    );

    page.drawText(
      `Assinado pelo inquilino: ${contract.tenantSignedAt ? "SIM" : "NÃO"}`,
      { x: 50, y: 510, size: 12, font }
    );

    page.drawText(`Gerado em: ${new Date().toLocaleDateString("pt-BR")}`, {
      x: 50,
      y: 480,
      size: 10,
      font,
    });

    const pdfBytes = await pdfDoc.save();

    return new NextResponse(pdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="contrato-${contract.id}.pdf"`,
      },
    });
  } catch (err: any) {
    console.error("❌ Erro ao gerar PDF (tenant):", err?.message || err);

    return NextResponse.json(
      { error: "Erro interno ao gerar PDF" },
      { status: 500 }
    );
  }
}

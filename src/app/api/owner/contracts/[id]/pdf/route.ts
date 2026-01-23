import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PDFDocument, StandardFonts } from "pdf-lib";

export const runtime = "nodejs";

export async function GET(
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

    if (!owner) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    if (owner.role !== "OWNER") {
      return NextResponse.json({ error: "Apenas OWNER" }, { status: 403 });
    }

    const contractId = params.id;

    const contract = await prisma.rentalContract.findUnique({
      where: { id: contractId },
      include: {
        tenantProfile: true,
      },
    });

    if (!contract) {
      return NextResponse.json({ error: "Contrato não encontrado" }, { status: 404 });
    }

    // ✅ dono do contrato precisa ser o OWNER logado
    if (contract.ownerId !== owner.id) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    // ✅ GERAR PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const text = contract.contractText || "Contrato vazio";
    const lines = text.split("\n");

    let y = 800;

    page.drawText("CONTRATO DE LOCAÇÃO", {
      x: 50,
      y,
      size: 16,
      font,
    });

    y -= 30;

    page.drawText(`Cidade: ${contract.signedCity ?? "-"}`, {
      x: 50,
      y,
      size: 10,
      font,
    });

    y -= 15;

    page.drawText(`Data: ${contract.signedAtDate ?? "-"}`, {
      x: 50,
      y,
      size: 10,
      font,
    });

    y -= 25;

    for (const line of lines) {
      if (y < 120) break;

      page.drawText(line.slice(0, 120), {
        x: 50,
        y,
        size: 10,
        font,
      });

      y -= 14;
    }

    y -= 10;

    page.drawText("ASSINATURAS:", { x: 50, y, size: 12, font });
    y -= 20;

    page.drawText(`Locador assinou: ${contract.ownerSignedAt ? "SIM" : "NÃO"}`, {
      x: 50,
      y,
      size: 10,
      font,
    });

    y -= 14;

    page.drawText(`Locatário assinou: ${contract.tenantSignedAt ? "SIM" : "NÃO"}`, {
      x: 50,
      y,
      size: 10,
      font,
    });

    const rentBR = (contract.rentValueCents / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

    y -= 20;

    page.drawText(`Valor do aluguel: ${rentBR}`, {
      x: 50,
      y,
      size: 10,
      font,
    });

    y -= 20;

    // ✅ Info do tenant
    page.drawText(
      `Inquilino: ${contract.tenantProfile?.fullName ?? "-"}`,
      { x: 50, y, size: 10, font }
    );

    const pdfBytes = await pdfDoc.save();

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="contrato-${contract.id}.pdf"`,
      },
    });
  } catch (err: any) {
    console.error("❌ Erro ao gerar PDF do contrato:", err?.message || err);
    return NextResponse.json({ error: "Erro interno ao gerar PDF" }, { status: 500 });
  }
}

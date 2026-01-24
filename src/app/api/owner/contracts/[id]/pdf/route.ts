import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PDFDocument, StandardFonts } from "pdf-lib";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const userId = session.user.id;
    const { id } = await context.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.role !== "OWNER") {
      return NextResponse.json(
        { error: "Apenas OWNER pode baixar esse PDF" },
        { status: 403 }
      );
    }

    const contract = await prisma.rentalContract.findUnique({
      where: { id },
      include: {
        tenantProfile: true,
        owner: true,
      },
    });

    if (!contract) {
      return NextResponse.json(
        { error: "Contrato não encontrado" },
        { status: 404 }
      );
    }

    // ✅ Segurança: contrato precisa ser do owner logado
    if (contract.ownerId !== userId) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    // ✅ Gerar PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let y = 800;

    page.drawText("CONTRATO DE LOCAÇÃO", {
      x: 50,
      y,
      size: 18,
      font: fontBold,
    });

    y -= 30;

    const text = contract.contractText || "Contrato não encontrado.";
    const lines = text.split("\n");

    for (const line of lines) {
      if (y < 60) break;

      page.drawText(line, {
        x: 50,
        y,
        size: 10,
        font,
      });

      y -= 14;
    }

    y -= 10;

    // ✅ Dados finais
    page.drawText(
      `Locador: ${contract.owner?.name || contract.owner?.email || ""}`,
      { x: 50, y, size: 10, font }
    );
    y -= 14;

    page.drawText(`Inquilino: ${contract.tenantProfile.fullName}`, {
      x: 50,
      y,
      size: 10,
      font,
    });

    const pdfBytes = await pdfDoc.save();

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="contrato-${id}.pdf"`,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

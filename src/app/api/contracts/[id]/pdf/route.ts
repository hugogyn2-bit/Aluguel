import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PDFDocument, StandardFonts } from "pdf-lib";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const contract = await prisma.rentalContract.findUnique({
      where: { id: params.id },
    });

    if (!contract) {
      return NextResponse.json({ error: "Contrato não encontrado" }, { status: 404 });
    }

    // remove emojis e caracteres inválidos
    const safeText = contract.contractText.replace(/[^\x00-\x7F]/g, "");

    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage([595, 842]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const lines = safeText.split("\n");
    let y = 800;

    for (const line of lines) {
      if (y < 60) {
        page = pdfDoc.addPage([595, 842]);
        y = 800;
      }

      page.drawText(line, {
        x: 40,
        y,
        size: 11,
        font,
      });

      y -= 16;
    }

    const pdfBytes = await pdfDoc.save();

    return new Response(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="contrato-${contract.id}.pdf"`,
      },
    });
  } catch (err) {
    console.error("PDF error:", err);
    return NextResponse.json({ error: "Erro interno no PDF" }, { status: 500 });
  }
}

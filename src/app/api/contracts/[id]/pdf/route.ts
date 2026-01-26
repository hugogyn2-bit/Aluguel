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
      return new Response(JSON.stringify({ error: "Não autenticado" }), {
        status: 401,
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        tenantProfile: true,
      },
    });

    if (!user) {
      return new Response(JSON.stringify({ error: "Usuário não encontrado" }), {
        status: 404,
      });
    }

    const contract = await prisma.rentalContract.findFirst({
      where: {
        id: params.id,
        OR: [
          { ownerId: user.id },
          { tenantProfileId: user.tenantProfile?.id },
        ],
      },
    });

    if (!contract) {
      return new Response(JSON.stringify({ error: "Contrato não encontrado" }), {
        status: 404,
      });
    }

    // ✅ GERA PDF
    const pdfDoc = await PDFDocument.create();

    // ✅ TEM QUE SER "let" (não const)
    let page = pdfDoc.addPage([595, 842]); // A4

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = 12;

    const marginLeft = 50;
    let y = 780;
    const lineHeight = 16;

    // ✅ evita crash de encoding do pdf-lib (emoji, acentos estranhos etc)
    const safeText =
      (contract.contractText || "Contrato vazio.")
        .replace(/[^\x00-\x7F]/g, "");

    const lines = safeText.split("\n");

    for (const line of lines) {
      if (y < 60) {
        page = pdfDoc.addPage([595, 842]);
        y = 780;
      }

      page.drawText(line, {
        x: marginLeft,
        y,
        size: fontSize,
        font,
      });

      y -= lineHeight;
    }

    const pdfBytes = await pdfDoc.save();

    // ✅ CORRETO: NextResponse não aceita Uint8Array
    const buffer = Buffer.from(pdfBytes);

    return new Response(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="contrato-${contract.id}.pdf"`,
      },
    });
  } catch (err) {
    console.error("Erro ao gerar PDF:", err);
    return new Response(JSON.stringify({ error: "Erro interno no PDF" }), {
      status: 500,
    });
  }
}

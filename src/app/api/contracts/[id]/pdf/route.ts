import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PDFDocument, StandardFonts } from "pdf-lib";

export const runtime = "nodejs";

function safeText(text: string) {
  // remove emoji e símbolos que quebram WinAnsi
  return text.replace(/[^\x00-\x7F]/g, "");
}

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

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

    const contract = await prisma.rentalContract.findUnique({
      where: { id },
      include: { tenantProfile: true },
    });

    if (!contract) {
      return NextResponse.json({ error: "Contrato não encontrado" }, { status: 404 });
    }

    const isOwnerAllowed = user.role === "OWNER" && contract.ownerId === user.id;
    const isTenantAllowed =
      user.role === "TENANT" &&
      user.tenantProfile &&
      contract.tenantProfileId === user.tenantProfile.id;

    if (!isOwnerAllowed && !isTenantAllowed) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage([595, 842]);

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = 12;

    const marginLeft = 50;
    const startY = 780;
    const lineHeight = 16;

    const text = safeText(contract.contractText || "Contrato vazio.");
    const lines = text.split("\n");

    let y = startY;

    for (const line of lines) {
      if (y < 60) {
        page = pdfDoc.addPage([595, 842]);
        y = startY;
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

    return new NextResponse(pdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="contrato-${contract.id}.pdf"`,
      },
    });
  } catch (err) {
    console.error("Erro ao gerar PDF:", err);
    return NextResponse.json(
      { error: "Erro interno no PDF" },
      { status: 500 }
    );
  }
}

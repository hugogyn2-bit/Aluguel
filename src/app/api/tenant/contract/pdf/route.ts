import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PDFDocument, StandardFonts } from "pdf-lib";

export const runtime = "nodejs";

export async function GET() {
  try {
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

    if (user.role !== "TENANT") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    if (!user.tenantProfile) {
      return NextResponse.json({ error: "Perfil de inquilino não encontrado" }, { status: 404 });
    }

    const contract = await prisma.rentalContract.findFirst({
      where: {
        tenantProfileId: user.tenantProfile.id,
      },
      orderBy: { createdAt: "desc" },
    });

    if (!contract) {
      return NextResponse.json({ error: "Contrato não encontrado" }, { status: 404 });
    }

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = 12;

    const marginLeft = 50;
    const startY = 780;
    const lineHeight = 16;

    const text = contract.contractText || "Contrato vazio.";
    const lines = text.split("\n");

    let y = startY;

    for (const line of lines) {
      if (y < 60) break;

      page.drawText(line, {
        x: marginLeft,
        y,
        size: fontSize,
        font,
      });

      y -= lineHeight;
    }

    const pdfBytes = await pdfDoc.save();

    // ✅ AQUI É O PONTO QUE CORRIGE O ERRO INTERNO:
    const buffer = Buffer.from(pdfBytes);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="contrato-${contract.id}.pdf"`,
      },
    });
  } catch (err) {
    console.error("Erro PDF Tenant:", err);
    return NextResponse.json({ error: "Erro interno no PDF" }, { status: 500 });
  }
}

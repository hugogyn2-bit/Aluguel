import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PDFDocument, StandardFonts } from "pdf-lib";

export const runtime = "nodejs";

export async function GET(_req: Request) {
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
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    if (!user.tenantProfile) {
      return NextResponse.json(
        { error: "Perfil de inquilino não encontrado" },
        { status: 404 }
      );
    }

    // ✅ AQUI ESTAVA O ERRO:
    // no Prisma schema NÃO EXISTE tenantId
    // o campo correto é tenantProfileId
    const contract = await prisma.rentalContract.findFirst({
      where: {
        tenantProfileId: user.tenantProfile.id,
        status: "ACTIVE",
      },
      include: {
        tenantProfile: {
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!contract) {
      return NextResponse.json(
        { error: "Contrato ativo não encontrado" },
        { status: 404 }
      );
    }

    // ✅ GERA PDF SIMPLES COM O TEXTO DO CONTRATO
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = 12;

    const marginLeft = 50;
    const startY = 780;
    const lineHeight = 16;

    const text = contract.contractText || "Contrato vazio.";

    // quebra por linhas simples
    const lines = text.split("\n");

    let y = startY;

    for (const line of lines) {
      if (y < 60) {
        // se passar do final da pagina
        const newPage = pdfDoc.addPage([595, 842]);
        y = startY;

        newPage.drawText(line, {
          x: marginLeft,
          y,
          size: fontSize,
          font,
        });

        continue;
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
    console.error("Erro ao gerar PDF do inquilino:", err);
    return NextResponse.json(
      { error: "Erro interno ao gerar PDF" },
      { status: 500 }
    );
  }
}

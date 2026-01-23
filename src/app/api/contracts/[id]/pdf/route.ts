import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PDFDocument, StandardFonts } from "pdf-lib";

export const runtime = "nodejs";

export async function GET(
  req: Request,
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
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const contract = await prisma.rentalContract.findUnique({
      where: { id },
      include: {
        tenantProfile: {
          include: {
            user: true,
            owner: true,
          },
        },
      },
    });

    if (!contract) {
      return NextResponse.json({ error: "Contrato não encontrado" }, { status: 404 });
    }

    // ✅ PERMISSÃO:
    const isOwnerAllowed =
      user.role === "OWNER" && contract.ownerId === user.id;

    const isTenantAllowed =
      user.role === "TENANT" &&
      contract.tenantProfile.userId === user.id;

    if (!isOwnerAllowed && !isTenantAllowed) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    // ✅ monta PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const fontSize = 11;
    const margin = 50;
    const maxWidth = 595.28 - margin * 2;

    const text = contract.contractText || "Contrato não encontrado.";

    function wrapText(text: string, maxChars: number) {
      const words = text.split(" ");
      const lines: string[] = [];
      let line = "";

      for (const word of words) {
        if ((line + word).length > maxChars) {
          lines.push(line.trim());
          line = "";
        }
        line += word + " ";
      }
      if (line.trim()) lines.push(line.trim());
      return lines;
    }

    const lines = wrapText(text, 95);

    let y = 800;
    for (const line of lines) {
      if (y < 80) break;
      page.drawText(line, {
        x: margin,
        y,
        size: fontSize,
        font,
        maxWidth,
      });
      y -= 16;
    }

    // ✅ info assinatura no rodapé
    const ownerSigned = contract.ownerSignedAt ? "✅ Assinado" : "❌ Não assinado";
    const tenantSigned = contract.tenantSignedAt ? "✅ Assinado" : "❌ Não assinado";

    page.drawText(`Locador: ${ownerSigned}`, {
      x: margin,
      y: 60,
      size: 10,
      font,
    });

    page.drawText(`Locatário: ${tenantSigned}`, {
      x: margin + 250,
      y: 60,
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
  } catch (err: any) {
    console.error("❌ Erro ao gerar PDF:", err?.message || err);
    return NextResponse.json({ error: "Erro interno no PDF" }, { status: 500 });
  }
}

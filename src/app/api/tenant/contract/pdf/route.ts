import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PDFDocument, StandardFonts } from "pdf-lib";

export const runtime = "nodejs";

export async function GET() {
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

  const contract = await prisma.rentalContract.findFirst({
    where: {
      tenantProfileId: user.tenantProfile.id,
    },
    orderBy: { createdAt: "desc" },
  });

  if (!contract) {
    return NextResponse.json({ error: "Contrato não encontrado" }, { status: 404 });
  }

  // ✅ GERAR PDF SIMPLES
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
    if (y < 70) break;

    page.drawText(line.slice(0, 120), {
      x: 50,
      y,
      size: 10,
      font,
    });

    y -= 14;
  }

  y -= 10;

  // ✅ Assinaturas (se existirem)
  page.drawText("ASSINATURAS:", { x: 50, y, size: 12, font });
  y -= 20;

  page.drawText(
    `Locador assinou: ${contract.ownerSignedAt ? "SIM" : "NÃO"}`,
    { x: 50, y, size: 10, font }
  );
  y -= 14;

  page.drawText(
    `Locatário assinou: ${contract.tenantSignedAt ? "SIM" : "NÃO"}`,
    { x: 50, y, size: 10, font }
  );

  const pdfBytes = await pdfDoc.save();

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="contrato-${contract.id}.pdf"`,
    },
  });
}

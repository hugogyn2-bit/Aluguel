import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function moneyBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function dateBR(date: Date) {
  return date.toLocaleDateString("pt-BR");
}

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

    // ✅ Proteção: OWNER só vê contratos dele / TENANT só vê contrato dele
    const isOwnerAllowed =
      user.role === "OWNER" && contract.ownerId === user.id;

    const isTenantAllowed =
      user.role === "TENANT" && contract.tenantUserId === user.id;

    if (!isOwnerAllowed && !isTenantAllowed) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    const tenantProfile = contract.tenantProfile;
    const tenantUser = tenantProfile.user;
    const ownerUser = tenantProfile.owner;

    // ✅ cria PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let y = 800;

    function write(text: string, bold = false, size = 12) {
      page.drawText(text, {
        x: 40,
        y,
        size,
        font: bold ? fontBold : font,
        color: rgb(1, 1, 1),
      });
      y -= size + 6;
    }

    write("CONTRATO DE LOCAÇÃO RESIDENCIAL", true, 16);
    y -= 10;

    write(`Contrato ID: ${contract.id}`, false, 11);
    write(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, false, 11);
    y -= 8;

    write("DADOS DO LOCADOR", true, 13);
    write(`Nome: ${ownerUser.name || "Locador"}`, false, 11);
    write(`Email: ${ownerUser.email}`, false, 11);
    y -= 10;

    write("DADOS DO LOCATÁRIO (INQUILINO)", true, 13);
    write(`Nome: ${tenantProfile.fullName}`, false, 11);
    write(`Email: ${tenantProfile.email}`, false, 11);
    write(`CPF: ${tenantProfile.cpf}`, false, 11);
    write(`RG: ${tenantProfile.rg}`, false, 11);
    write(
      `Nascimento: ${tenantProfile.birthDate ? dateBR(tenantProfile.birthDate) : "-"}`,
      false,
      11
    );
    write(`Telefone: ${tenantProfile.phone}`, false, 11);
    y -= 10;

    write("IMÓVEL / ENDEREÇO", true, 13);
    write(`Endereço: ${tenantProfile.address}`, false, 11);
    write(`CEP: ${tenantProfile.cep}`, false, 11);
    write(`Cidade: ${tenantProfile.city}`, false, 11);
    y -= 10;

    write("VALOR DO ALUGUEL", true, 13);
    write(`Valor: ${moneyBRL(tenantProfile.rentValueCents)}`, false, 11);
    y -= 10;

    write("ASSINATURAS", true, 13);
    write(
      `Locador: ${contract.ownerSignedAt ? "ASSINADO ✅" : "PENDENTE ❌"}`,
      false,
      11
    );
    write(
      `Inquilino: ${contract.tenantSignedAt ? "ASSINADO ✅" : "PENDENTE ❌"}`,
      false,
      11
    );
    y -= 15;

    // ✅ cidade e data automáticas (opção A que você pediu)
    write(
      `${tenantProfile.city}, ${new Date().toLocaleDateString("pt-BR")}.`,
      false,
      11
    );

    y -= 20;

    write("__________________________________________", false, 11);
    write("LOCADOR", true, 11);

    y -= 10;

    write("__________________________________________", false, 11);
    write("LOCATÁRIO", true, 11);

    const bytes = await pdfDoc.save();

    return new NextResponse(bytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="contrato-${contract.id}.pdf"`,
      },
    });
  } catch (err: any) {
    console.error("❌ Erro ao gerar PDF:", err?.message || err);
    return NextResponse.json({ error: "Erro ao gerar PDF" }, { status: 500 });
  }
}

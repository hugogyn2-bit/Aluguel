function formatPtBrLongDate(date: Date) {
  const day = String(date.getDate()).padStart(2, "0");
  const monthName = date.toLocaleDateString("pt-BR", { month: "long" });
  const year = date.getFullYear();
  return { day, monthName, year };
}

export function buildContractText(params: {
  city: string;
  tenantName: string;
  ownerName: string;
  rentAmountCents: number;
  address: string;
  cep: string;
  cpf: string;
  rg: string;
  phone: string;
}) {
  const now = new Date();
  const { day, monthName, year } = formatPtBrLongDate(now);

  // ✅ aqui monta exatamente igual a parte do contrato
  const assinaturaLocalData = `${params.city}, ${day} de ${monthName} de ${year}.`;

  return `
CONTRATO DE LOCAÇÃO

... resto do contrato ...

${assinaturaLocalData}

LOCADOR: ${params.ownerName}
LOCATÁRIO: ${params.tenantName}
`;
}

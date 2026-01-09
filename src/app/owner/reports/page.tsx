import Link from "next/link";

import { Card } from "@/components/Card";

export default function Page() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Relatórios</h1>
          <p className="text-muted mt-1">Resumo do que entra e sai. (Em breve gráficos e exportação.)</p>
        </div>
        <Link
          className="text-sm underline underline-offset-4 opacity-90 hover:opacity-100"
          href="/owner"
        >
          Voltar
        </Link>
      </div>

      <div className="mt-6 grid gap-4">
        <Card className="p-5">
          <h2 className="font-bold">Receitas do mês</h2>
          <p className="text-sm text-muted mt-1">
            Placeholder: aqui vamos somar aluguéis pagos, multas e outras receitas.
          </p>
        </Card>

        <Card className="p-5">
          <h2 className="font-bold">Inadimplência</h2>
          <p className="text-sm text-muted mt-1">
            Placeholder: lista de contratos em atraso e dias de atraso.
          </p>
        </Card>

        <Card className="p-5">
          <h2 className="font-bold">Exportar</h2>
          <p className="text-sm text-muted mt-1">
            Placeholder: exportar em PDF/CSV.
          </p>
        </Card>
      </div>
    </main>
  );
}

import Link from "next/link";

import { Card } from "@/components/Card";

export default function Page() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Aluguéis</h1>
          <p className="text-sm text-muted mt-2">
            Controle de cobranças e status. Este módulo está pronto para receber
            suas regras de negócio.
          </p>
        </div>

        <Link href="/owner" className="text-sm underline opacity-80 hover:opacity-100">
          Voltar
        </Link>
      </div>

      <div className="mt-6 grid gap-4">
        <Card className="p-6">
          <h2 className="font-bold">Resumo</h2>
          <ul className="mt-3 grid gap-2 text-sm text-muted">
            <li>• Total ativos: 0</li>
            <li>• Pagos no mês: R$ 0,00</li>
            <li>• Em atraso: 0</li>
          </ul>
        </Card>

        <Card className="p-6">
          <h2 className="font-bold">Próximos passos</h2>
          <ol className="mt-3 grid gap-2 text-sm text-muted">
            <li>1) Vincular um inquilino a um imóvel.</li>
            <li>2) Definir vencimento e valor do aluguel.</li>
            <li>3) Marcar pagamentos e gerar recibos.</li>
          </ol>
        </Card>
      </div>
    </main>
  );
}

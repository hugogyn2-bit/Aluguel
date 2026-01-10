import Link from "next/link";

import { Card } from "@/components/Card";

export default function Page() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Imóveis</h1>
          <p className="text-sm text-muted mt-2">
            Aqui você vai cadastrar e editar seus imóveis. Nesta versão, deixei a estrutura pronta com ações de exemplo.
          </p>
        </div>

        <Link
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm"
          href="/owner"
        >
          Voltar
        </Link>
      </div>

      <div className="mt-8 grid gap-4">
        <Card className="p-6">
          <h2 className="text-base font-bold">Próximos passos</h2>
          <ul className="mt-3 list-disc pl-5 text-sm text-muted grid gap-2">
            <li>Criar o modelo <code className="px-1 py-0.5 rounded bg-black/20">Property</code> no Prisma</li>
            <li>Formulário: nome, endereço, tipo, valor</li>
            <li>Lista com editar/excluir</li>
          </ul>
        </Card>

        <Card className="p-6">
          <h2 className="text-base font-bold">Acesso rápido</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm" href="/owner/tenants">
              Inquilinos
            </Link>
            <Link className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm" href="/owner/rents">
              Aluguéis
            </Link>
            <Link className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm" href="/owner/reports">
              Relatórios
            </Link>
          </div>
        </Card>
      </div>
    </main>
  );
}

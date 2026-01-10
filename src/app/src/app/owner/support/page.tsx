import Link from "next/link";

import { Card } from "@/components/Card";

export default function Page() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Suporte</h1>
          <p className="text-sm text-muted mt-2">
            Central de ajuda e contato. (placeholder)
          </p>
        </div>

        <Link
          href="/owner"
          className="rounded-full border border-white/10 bg-surface px-4 py-2 text-sm font-semibold"
        >
          Voltar
        </Link>
      </div>

      <Card className="p-7 mt-6">
        <div className="grid gap-2">
          <h2 className="text-lg font-extrabold">Canais</h2>
          <ul className="list-disc pl-5 text-sm text-muted">
            <li>WhatsApp (coloque seu número aqui)</li>
            <li>E-mail de suporte (coloque aqui)</li>
            <li>Horário de atendimento (coloque aqui)</li>
          </ul>

          <div className="mt-4 rounded-2xl border border-white/10 bg-black/10 p-4 text-sm">
            Dica: quando integrar de verdade, você pode abrir tickets por imóvel/locação.
          </div>
        </div>
      </Card>
    </main>
  );
}

import Link from "next/link";

export default function OwnerHomePage() {
  return (
    <main className="min-h-screen bg-black text-white px-6 py-12">
      <div className="mx-auto max-w-6xl space-y-10">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-black">
            Painel do Proprietário
          </h1>
          <p className="text-white/60 mt-2">
            Gerencie inquilinos, contratos e sua assinatura.
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

          <Link
            href="/owner/tenants"
            className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition"
          >
            <div className="text-xl font-bold">👥 Inquilinos</div>
            <p className="text-white/60 text-sm mt-1">
              Cadastrar, visualizar e gerenciar inquilinos
            </p>
          </Link>

          <Link
            href="/owner/contracts"
            className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition"
          >
            <div className="text-xl font-bold">📄 Contratos</div>
            <p className="text-white/60 text-sm mt-1">
              Ver, assinar e baixar contratos
            </p>
          </Link>

          <Link
            href="/owner/premium"
            className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-6 hover:bg-yellow-500/20 transition"
          >
            <div className="text-xl font-bold">💎 Premium</div>
            <p className="text-white/70 text-sm mt-1">
              Ativar plano, ver status e faturamento
            </p>
          </Link>

        </div>

      </div>
    </main>
  );
}

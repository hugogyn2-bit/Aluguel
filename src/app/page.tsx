import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-4xl px-6 py-14">
        <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-purple-300 bg-clip-text text-transparent">
          Aluga — Painel
        </h1>

        <p className="mt-3 text-white/70">
          Você está logado ✅. Agora você pode acessar o painel do proprietário e gerenciar seus imóveis.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Link
            href="/owner"
            className="rounded-2xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 transition"
          >
            <div className="text-lg font-bold">🏠 Área do Proprietário</div>
            <div className="text-sm text-white/60 mt-1">
              Cadastrar inquilinos, imóveis e gerenciar pagamentos
            </div>
          </Link>

          <Link
            href="/owner/premium"
            className="rounded-2xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 transition"
          >
            <div className="text-lg font-bold">💎 Premium / Assinatura</div>
            <div className="text-sm text-white/60 mt-1">
              Ver status do trial e desbloquear tudo
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}

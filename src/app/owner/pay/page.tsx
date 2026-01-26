import Link from "next/link";

export default function OwnerPayPage() {
  return (
    <main className="min-h-screen bg-black text-white px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-black">💳 Pagamentos / Premium</h1>
        <p className="text-white/70 mt-2">
          Aqui você pode ativar premium ou gerenciar assinatura.
        </p>

        <div className="mt-6 grid gap-4">
          <Link
            href="/owner/premium"
            className="rounded-2xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 transition"
          >
            <div className="text-lg font-bold">Ir para Premium</div>
            <div className="text-sm text-white/60">
              Ativar assinatura e desbloquear tudo.
            </div>
          </Link>

          <Link
            href="/owner"
            className="rounded-xl bg-white/10 border border-white/10 px-4 py-3 font-semibold hover:bg-white/15 w-fit"
          >
            ⬅️ Voltar
          </Link>
        </div>
      </div>
    </main>
  );
}

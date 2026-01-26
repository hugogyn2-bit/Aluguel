"use client";

export default function OwnerPremiumPage() {
  return (
    <div className="min-h-screen bg-black text-white px-6 py-10">
      <div className="mx-auto w-full max-w-3xl rounded-2xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-2xl font-extrabold">💎 Premium</h1>
        <p className="mt-2 text-white/60">
          Aqui você pode ativar Premium e acessar o portal do Stripe.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <a
            href="/api/pay/owner/start"
            className="rounded-xl bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-purple-600 px-4 py-3 font-semibold text-center hover:opacity-95"
          >
            ✅ Assinar Premium
          </a>

          <a
            href="/api/pay/owner/portal"
            className="rounded-xl bg-white/10 border border-white/10 px-4 py-3 font-semibold text-center hover:bg-white/15"
          >
            🔁 Gerenciar assinatura (Stripe Portal)
          </a>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

type OwnerMe = {
  isPremium: boolean;
  premiumUntil: string | null;
};

export default function OwnerPremiumPage() {
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<OwnerMe | null>(null);

  async function loadMe() {
    const res = await fetch("/api/owner/me");
    const data = await res.json();
    setMe(data);
    setLoading(false);
  }

  async function startCheckout() {
    const res = await fetch("/api/pay/owner/start", {
      method: "POST",
    });

    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      alert("Erro ao iniciar pagamento");
    }
  }

  async function openPortal() {
    const res = await fetch("/api/pay/owner/portal", {
      method: "POST",
    });

    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      alert("Erro ao abrir portal");
    }
  }

  useEffect(() => {
    loadMe();
  }, []);

  if (loading) {
    return <div className="p-10 text-white">Carregando...</div>;
  }

  return (
    <main className="min-h-screen bg-black text-white px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-extrabold">💎 Premium</h1>

        {me?.isPremium ? (
          <div className="mt-6 rounded-2xl border border-green-500/30 bg-green-500/10 p-6">
            <p className="text-green-300 font-bold text-lg">
              Premium ativo ✅
            </p>
            <p className="text-white/70 mt-2">
              Válido até{" "}
              <b>
                {me.premiumUntil
                  ? new Date(me.premiumUntil).toLocaleString()
                  : "—"}
              </b>
            </p>

            <button
              onClick={openPortal}
              className="mt-5 rounded-xl bg-white/10 px-4 py-3 hover:bg-white/20"
            >
              ⚙️ Gerenciar assinatura
            </button>
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-lg font-bold">Conta gratuita</p>
            <p className="text-white/60 mt-2">
              Você tem <b>24 horas de trial</b> ao assinar.
            </p>

            <button
              onClick={startCheckout}
              className="mt-5 rounded-xl bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-purple-600 px-5 py-3 font-semibold"
            >
              💳 Assinar Premium
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

"use client";

import { useEffect, useState } from "react";

export default function OwnerPremiumPage() {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [trialEndsAt, setTrialEndsAt] = useState<string | null>(null);
  const [ownerPaid, setOwnerPaid] = useState(false);

  async function refreshStatus() {
    setLoading(true);

    const res = await fetch("/api/pay/owner/verify");
    const data = await res.json();

    setAllowed(!!data.allowed);
    setOwnerPaid(!!data.ownerPaid);
    setTrialEndsAt(
      data.trialEndsAt ? new Date(data.trialEndsAt).toLocaleString() : null
    );

    setLoading(false);
  }

  async function startTrial() {
    const res = await fetch("/api/owner/trial/start", { method: "POST" });
    const data = await res.json();

    if (!res.ok) {
      alert(data?.error || "Erro ao ativar trial");
      return;
    }

    alert(data?.message || "Trial ativado ✅");
    await refreshStatus();
    window.location.href = "/owner";
  }

  async function goPremium() {
    const res = await fetch("/api/pay/owner/start", { method: "POST" });
    const data = await res.json();

    if (data.url) {
      window.location.href = data.url;
    } else {
      alert(data.error || "Erro ao iniciar pagamento");
    }
  }

  async function openPortal() {
    const res = await fetch("/api/pay/owner/portal", { method: "POST" });
    const data = await res.json();

    if (data.url) {
      window.location.href = data.url;
    } else {
      alert(data.error || "Erro ao abrir portal");
    }
  }

  useEffect(() => {
    refreshStatus();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Carregando...
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-12 text-white">
      <div className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
        <h1 className="text-3xl font-extrabold mb-3">Premium do Proprietário</h1>

        <p className="text-white/70 mb-6">
          Status atual:{" "}
          {allowed ? (
            <span className="text-green-300 font-semibold">✅ Liberado</span>
          ) : (
            <span className="text-red-300 font-semibold">❌ Bloqueado (Paywall)</span>
          )}
        </p>

        {trialEndsAt && (
          <p className="text-sm text-white/60 mb-6">
            ⏳ Trial termina em: <span className="text-white">{trialEndsAt}</span>
          </p>
        )}

        <div className="flex flex-col md:flex-row gap-3">
          <button
            onClick={startTrial}
            className="rounded-xl px-4 py-3 bg-white/10 border border-white/10 hover:bg-white/15"
          >
            🚀 Ativar Trial (24h)
          </button>

          <button
            onClick={goPremium}
            className="rounded-xl px-4 py-3 bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-purple-600 font-semibold hover:opacity-95"
          >
            💳 Virar Premium (R$29,90/mês)
          </button>

          {ownerPaid ? (
            <button
              onClick={openPortal}
              className="rounded-xl px-4 py-3 bg-red-500/20 border border-red-500/30 hover:bg-red-500/25"
            >
              ⚠️ Cancelar assinatura
            </button>
          ) : null}
        </div>

        <div className="mt-8 text-sm text-white/60">
          ✅ O Trial libera o sistema por 24 horas. <br />
          ✅ Depois disso, só libera novamente com Premium.
        </div>

        <div className="mt-6">
          <a
            href="/owner"
            className="text-sm text-white/70 hover:text-white underline"
          >
            ← Voltar para Área do Proprietário
          </a>
        </div>
      </div>
    </div>
  );
}

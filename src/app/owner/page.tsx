"use client";

import { useEffect, useState } from "react";

export default function OwnerPage() {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [trialEndsAt, setTrialEndsAt] = useState<string | null>(null);
  const [ownerPaid, setOwnerPaid] = useState(false);

  async function refreshStatus() {
    setLoading(true);

    try {
      const res = await fetch("/api/pay/owner/verify", { cache: "no-store" });
      const data = await res.json();

      if (!res.ok) {
        setAllowed(false);
        setOwnerPaid(false);
        setTrialEndsAt(null);
        setLoading(false);
        return;
      }

      setAllowed(Boolean(data.allowed));
      setOwnerPaid(Boolean(data.ownerPaid));
      setTrialEndsAt(
        data.trialEndsAt ? new Date(data.trialEndsAt).toLocaleString() : null
      );
    } catch {
      setAllowed(false);
      setOwnerPaid(false);
      setTrialEndsAt(null);
    } finally {
      setLoading(false);
    }
  }

  async function startTrial() {
    try {
      const res = await fetch("/api/owner/trial/start", { method: "POST" });
      const data = await res.json();
      alert(data.message || "Trial processado");
      await refreshStatus();
    } catch {
      alert("Erro interno ao ativar trial.");
    }
  }

  async function goPremium() {
    try {
      const res = await fetch("/api/pay/owner/start", { method: "POST" });
      const data = await res.json();

      if (data?.url) {
        window.location.href = data.url;
        return;
      }

      alert(data?.error || "Erro ao iniciar pagamento");
    } catch {
      alert("Erro interno ao iniciar premium.");
    }
  }

  async function openPortal() {
    try {
      const res = await fetch("/api/pay/owner/portal", { method: "POST" });
      const data = await res.json();

      if (data?.url) {
        window.location.href = data.url;
        return;
      }

      alert(data?.error || "Erro ao abrir portal");
    } catch {
      alert("Erro interno ao abrir portal.");
    }
  }

  useEffect(() => {
    refreshStatus();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-black">
        Carregando...
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-12 text-white bg-black">
      <div className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
        <h1 className="text-3xl font-extrabold mb-3">Área do Proprietário</h1>

        <p className="text-white/70 mb-6">
          Status atual:{" "}
          {allowed ? (
            <span className="text-green-300 font-semibold">✅ Liberado</span>
          ) : (
            <span className="text-red-300 font-semibold">
              ❌ Bloqueado (Paywall)
            </span>
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
              ⚙️ Gerenciar / Cancelar assinatura
            </button>
          ) : null}
        </div>

        <div className="mt-8 text-sm text-white/60">
          ✅ O Trial libera o sistema por 24 horas. <br />
          ✅ Depois disso, só libera novamente com Premium.
        </div>
      </div>
    </div>
  );
}

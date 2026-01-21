"use client";

import { useState } from "react";

export default function OwnerPremiumPage() {
  const [msg, setMsg] = useState("");
  const [loadingTrial, setLoadingTrial] = useState(false);
  const [loadingPay, setLoadingPay] = useState(false);
  const [loadingCancel, setLoadingCancel] = useState(false);

  async function startTrial() {
    setLoadingTrial(true);
    setMsg("");

    try {
      const res = await fetch("/api/owner/trial/start", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        setMsg(data?.error || "Erro ao iniciar trial");
        return;
      }

      setMsg(data?.message || "Trial iniciado ✅");
      setTimeout(() => {
        window.location.href = "/owner/dashboard";
      }, 1200);
    } catch {
      setMsg("Erro interno no trial.");
    } finally {
      setLoadingTrial(false);
    }
  }

  async function subscribePremium() {
    setLoadingPay(true);
    setMsg("");

    try {
      const res = await fetch("/api/pay/owner/start", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        setMsg(data?.error || "Erro ao iniciar pagamento");
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch {
      setMsg("Erro interno no pagamento.");
    } finally {
      setLoadingPay(false);
    }
  }

  async function cancelSubscription() {
    setLoadingCancel(true);
    setMsg("");

    try {
      const res = await fetch("/api/pay/owner/cancel", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        setMsg(data?.error || "Erro ao cancelar assinatura");
        return;
      }

      setMsg(data?.message || "Cancelado ✅");
    } catch {
      setMsg("Erro interno no cancelamento.");
    } finally {
      setLoadingCancel(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <h1 className="text-2xl font-extrabold">Premium OWNER</h1>
        <p className="mt-2 text-white/70">
          Para cadastrar inquilinos e liberar recursos do proprietário, você
          precisa de acesso premium.
        </p>

        <div className="mt-6 space-y-3">
          <button
            onClick={startTrial}
            disabled={loadingTrial}
            className="w-full rounded-xl bg-white/10 border border-white/10 px-4 py-3 font-semibold hover:bg-white/15 disabled:opacity-60"
          >
            {loadingTrial ? "Ativando Trial..." : "🚀 Trial grátis 24h"}
          </button>

          <button
            onClick={subscribePremium}
            disabled={loadingPay}
            className="w-full rounded-xl bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-purple-600 px-4 py-3 font-semibold hover:opacity-95 disabled:opacity-60"
          >
            {loadingPay ? "Abrindo pagamento..." : "💳 Assinar Premium (R$ 29,90/mês)"}
          </button>

          <button
            onClick={cancelSubscription}
            disabled={loadingCancel}
            className="w-full rounded-xl bg-red-500/20 border border-red-500/30 px-4 py-3 font-semibold hover:bg-red-500/30 disabled:opacity-60"
          >
            {loadingCancel ? "Cancelando..." : "Cancelar assinatura"}
          </button>

          {msg ? (
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
              {msg}
            </div>
          ) : null}
        </div>

        <p className="mt-6 text-xs text-white/50">
          * Cancelamento mantém acesso até o fim do período pago.
        </p>
      </div>
    </div>
  );
}

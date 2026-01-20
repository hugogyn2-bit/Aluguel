"use client";

import { useState } from "react";

export default function PaywallPage() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function goPremium() {
    setLoading(true);
    setMsg("");

    try {
      // ✅ chama sua API do Stripe (backend)
      const res = await fetch("/api/pay/owner/start", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        setMsg(data?.error || "Erro ao abrir pagamento.");
        setLoading(false);
        return;
      }

      // ✅ redireciona pro Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setMsg("Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white p-6">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-2xl font-bold mb-2">Premium</h1>
        <p className="text-white/60 mb-6">
          Assine para desbloquear recursos completos.
        </p>

        {msg ? (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
            {msg}
          </div>
        ) : null}

        <button
          onClick={goPremium}
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-purple-600 px-4 py-3 font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Abrindo pagamento..." : "Assinar Premium R$29,90/mês"}
        </button>
      </div>
    </div>
  );
}

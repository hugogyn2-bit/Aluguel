"use client";

import { useState } from "react";

export default function BillingPage() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function openPortal() {
    setLoading(true);
    setMsg("");

    try {
      const res = await fetch("/api/pay/owner/portal", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        setMsg(data?.error || "Erro ao abrir portal.");
        setLoading(false);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setMsg("Erro interno.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white p-6">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-2xl font-bold mb-2">Minha assinatura</h1>
        <p className="text-white/60 mb-6">
          Aqui você pode cancelar ou trocar seu cartão.
        </p>

        {msg ? (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
            {msg}
          </div>
        ) : null}

        <button
          onClick={openPortal}
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-purple-600 px-4 py-3 font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Abrindo portal..." : "Gerenciar assinatura (cancelar)"}
        </button>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleForgotPassword() {
    setLoading(true);
    setMsg(null);
    setError(null);

    try {
      const res = await fetch("/api/auth/forgot-password/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "Erro ao solicitar redefinição.");
        return;
      }

      setMsg(
        data?.message ||
          "Se esse e-mail existir, enviamos as instruções ✅"
      );
    } catch {
      setError("Erro interno. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-3">
      <input
        type="email"
        placeholder="E-mail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 outline-none focus:border-white/20"
      />

      <button
        onClick={handleForgotPassword}
        disabled={loading}
        className="w-full rounded-xl bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-purple-600 px-4 py-3 font-semibold text-white hover:opacity-95 disabled:opacity-60"
      >
        {loading ? "Enviando..." : "Enviar link de recuperação"}
      </button>

      {msg && (
        <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {msg}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}
    </div>
  );
}

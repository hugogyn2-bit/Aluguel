"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function ResetPasswordClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMsg(data?.error || "Erro ao redefinir senha.");
        setLoading(false);
        return;
      }

      setMsg("✅ Senha alterada com sucesso! Indo para login...");
      setTimeout(() => router.push("/auth/sign-in"), 1200);
    } catch {
      setMsg("Erro interno.");
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 text-white">
      <div className="w-full max-w-md bg-black/40 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-[0_0_80px_rgba(0,255,255,0.15)]">
        <h1 className="text-2xl font-bold mb-2">Resetar senha</h1>
        <p className="text-sm text-white/60 mb-6">
          Informe sua nova senha para continuar.
        </p>

        {!token || !email ? (
          <div className="text-red-300 text-sm">
            Link inválido. Volte e tente novamente.
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-white/70">Nova senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 outline-none focus:border-cyan-400/60"
                placeholder="Digite sua nova senha"
                required
              />
            </div>

            {msg && (
              <div className="text-sm text-white/80 bg-white/5 border border-white/10 rounded-xl p-3">
                {msg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl px-4 py-3 bg-cyan-500/20 border border-cyan-400/30 hover:bg-cyan-500/30 transition"
            >
              {loading ? "Salvando..." : "Salvar nova senha"}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link href="/auth/sign-in" className="text-sm text-cyan-300">
            Voltar para login
          </Link>
        </div>
      </div>
    </div>
  );
}

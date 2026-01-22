"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ResetPasswordClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function handleReset() {
    setMsg(null);

    if (!token) {
      setMsg("Token inválido ou ausente.");
      return;
    }

    if (password.length < 6) {
      setMsg("A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setMsg("As senhas não conferem.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMsg(data?.error || "Erro ao redefinir senha.");
        return;
      }

      setMsg("✅ Senha redefinida com sucesso! Redirecionando...");
      setTimeout(() => {
        router.push("/auth/sign-in");
      }, 1200);
    } catch {
      setMsg("Erro interno, tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <h1 className="text-2xl font-extrabold">Redefinir senha</h1>

        <p className="mt-2 text-white/70 text-sm">
          Digite sua nova senha abaixo.
        </p>

        <div className="mt-6 space-y-3">
          <input
            type="password"
            placeholder="Nova senha"
            className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <input
            type="password"
            placeholder="Confirmar nova senha"
            className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 outline-none"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <button
            onClick={handleReset}
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-purple-600 px-4 py-3 font-semibold hover:opacity-95 disabled:opacity-60"
          >
            {loading ? "Salvando..." : "Salvar nova senha"}
          </button>

          {msg ? (
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
              {msg}
            </div>
          ) : null}

          <div className="text-sm text-white/60 text-center">
            <a className="underline" href="/auth/sign-in">
              Voltar para login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

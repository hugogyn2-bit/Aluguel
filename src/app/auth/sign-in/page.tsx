"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function SignInPage() {
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
      callbackUrl,
    });

    if (!res?.ok) {
      setMsg("Email ou senha inválidos.");
      setLoading(false);
      return;
    }

    window.location.href = callbackUrl;
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-xl rounded-[28px] border border-white/10 bg-gradient-to-b from-[#15101f] to-[#0b0a10] p-8 shadow-2xl">
        {/* Top */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center text-xl font-bold">
              A
            </div>
            <div>
              <div className="text-xl font-bold leading-tight">Aluguel</div>
              <div className="text-sm text-white/50">Neon Access Portal</div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-sm font-semibold text-white/80">Bem-vindo</div>
            <div className="text-xs text-white/40">Acesso seguro</div>
          </div>
        </div>

        {/* Title */}
        <h1 className="mt-10 text-4xl font-extrabold">Entrar</h1>
        <p className="mt-2 text-white/60">
          Faça login para continuar ✨
        </p>

        {/* Form */}
        <form onSubmit={handleLogin} className="mt-8 space-y-5">
          <div>
            <label className="text-sm text-white/60">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="seuemail@email.com"
              className="mt-2 w-full rounded-2xl bg-[#EAF2FF] px-5 py-4 text-black outline-none"
              required
            />
          </div>

          <div>
            <label className="text-sm text-white/60">Senha</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="••••••••"
              className="mt-2 w-full rounded-2xl bg-[#EAF2FF] px-5 py-4 text-black outline-none"
              required
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={() => setRemember(!remember)}
              className="flex items-center gap-3 text-white/70"
            >
              <span
                className={`h-6 w-12 rounded-full border border-white/10 p-1 transition ${
                  remember ? "bg-cyan-500/60" : "bg-white/10"
                }`}
              >
                <span
                  className={`block h-4 w-4 rounded-full bg-white transition ${
                    remember ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </span>
              Lembrar de mim
            </button>

            <Link href="/auth/forgot" className="text-cyan-300 hover:opacity-90">
              Esqueci minha senha →
            </Link>
          </div>

          <button
            disabled={loading}
            type="submit"
            className="w-full rounded-2xl bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-purple-600 py-4 font-extrabold text-lg hover:opacity-95 disabled:opacity-60"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>

          {msg ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
              {msg}
            </div>
          ) : null}
        </form>

        <div className="mt-8 flex items-center justify-between text-sm text-white/60">
          <div>Não tem conta?</div>
          <Link href="/auth/sign-up" className="text-cyan-300 hover:opacity-90">
            Criar conta →
          </Link>
        </div>
      </div>
    </div>
  );
}

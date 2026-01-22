"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function SignInClient() {
  const searchParams = useSearchParams();

  const callbackUrl = searchParams.get("callbackUrl") || "/";

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

    setLoading(false);

    if (!res?.ok) {
      setMsg("Email ou senha inválidos");
      return;
    }

    window.location.href = res.url || callbackUrl;
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl shadow-2xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-purple-600 flex items-center justify-center font-bold text-2xl">
            A
          </div>

          <div>
            <h1 className="text-xl font-extrabold">Aluguel</h1>
            <p className="text-white/60 text-sm">Neon Access Portal</p>
          </div>

          <div className="ml-auto text-right">
            <p className="text-white/70 text-sm font-semibold">Bem-vindo</p>
            <p className="text-white/40 text-xs">Acesso seguro</p>
          </div>
        </div>

        <h2 className="text-4xl font-extrabold mb-2">Entrar</h2>
        <p className="text-white/60 mb-8">Faça login para continuar ✨</p>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-white/70 text-sm mb-2">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl bg-white/90 text-black px-5 py-4 outline-none"
              placeholder="seuemail@email.com"
              type="email"
              required
            />
          </div>

          <div>
            <label className="block text-white/70 text-sm mb-2">Senha</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl bg-white/90 text-black px-5 py-4 outline-none"
              placeholder="••••••"
              type="password"
              required
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-3 text-white/70 cursor-pointer">
              <input
                type="checkbox"
                checked={remember}
                onChange={() => setRemember(!remember)}
                className="h-5 w-5 accent-fuchsia-500"
              />
              Lembrar de mim
            </label>

            <a
              href="/auth/forgot"
              className="text-cyan-300 hover:text-cyan-200 font-semibold"
            >
              Esqueci minha senha →
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-purple-600 py-4 font-bold text-lg hover:opacity-95 disabled:opacity-60"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>

          {msg ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-red-200">
              {msg}
            </div>
          ) : null}
        </form>

        <div className="mt-8 flex justify-between text-sm text-white/60">
          <span>Não tem conta?</span>
          <a href="/auth/sign-up" className="text-cyan-300 font-semibold hover:text-cyan-200">
            Criar conta →
          </a>
        </div>
      </div>
    </div>
  );
}

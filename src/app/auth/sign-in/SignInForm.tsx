"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

export default function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const created = useMemo(
    () => searchParams.get("created") === "1",
    [searchParams]
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    setLoading(true);
    setError(null);

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    setLoading(false);

    if (!res || !res.ok) {
      setError("E-mail ou senha inválidos.");
      return;
    }

    router.push("/api/post-login");
  }

  return (
    <div className="grid gap-3">
      {created && (
        <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          Usuário criado com sucesso. Faça login abaixo.
        </div>
      )}

      <input
        type="email"
        placeholder="E-mail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 outline-none focus:border-white/20"
      />

      <input
        type="password"
        placeholder="Senha"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 outline-none focus:border-white/20"
      />

      <button
        onClick={handleLogin}
        disabled={loading}
        className="w-full rounded-xl bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-purple-600 px-4 py-3 font-semibold text-white hover:opacity-95 disabled:opacity-60"
      >
        {loading ? "Entrando..." : "Entrar"}
      </button>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="mt-2 flex items-center justify-between text-sm text-white/60">
        <a href="/auth/sign-up" className="hover:text-white">
          Criar conta
        </a>
        <a href="/auth/forgot-password" className="hover:text-white">
          Esqueci minha senha
        </a>
      </div>
    </div>
  );
}

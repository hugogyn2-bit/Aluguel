"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export function SignInForm() {
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
    <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
      {created && (
        <div
          style={{
            padding: 10,
            borderRadius: 10,
            background: "rgba(16, 185, 129, 0.12)",
            border: "1px solid rgba(16, 185, 129, 0.25)",
            fontSize: 14,
          }}
        >
          Usuário criado com sucesso. Faça login abaixo.
        </div>
      )}

      <input
        type="email"
        placeholder="E-mail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
      />

      <input
        type="password"
        placeholder="Senha"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="current-password"
      />

      <button onClick={handleLogin} disabled={loading}>
        {loading ? "Entrando..." : "Entrar"}
      </button>

      {error && <p style={{ color: "crimson" }}>{error}</p>}

      <div style={{ fontSize: 14, opacity: 0.85 }}>
        <a href="/auth/sign-up">Criar conta</a> •{" "}
        <a href="/auth/forgot-password">Esqueci minha senha</a>
      </div>
    </div>
  );
}

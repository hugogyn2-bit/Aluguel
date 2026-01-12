"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 🔒 Garante que o formulário só exista após hidratação
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const created = useMemo(
    () => searchParams.get("created") === "1",
    [searchParams]
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); // 🚨 ESSENCIAL
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

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

    // ✅ redirecionamento controlado pelo backend
    router.push("/api/post-login");
  }

  // ⛔ impede submit antes do JS estar ativo
  if (!mounted) return null;

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

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <input
          name="email"
          type="email"
          placeholder="E-mail"
          required
          autoComplete="email"
        />

        <input
          name="password"
          type="password"
          placeholder="Senha"
          required
          autoComplete="current-password"
        />

        <button type="submit" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </button>

        {error && (
          <p style={{ color: "crimson", margin: 0 }}>{error}</p>
        )}
      </form>

      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          fontSize: 14,
          opacity: 0.85,
        }}
      >
        <a href="/auth/sign-up">Criar conta</a>
        <span>•</span>
        <a href="/auth/forgot-password">Esqueci minha senha</a>
      </div>
    </div>
  );
}

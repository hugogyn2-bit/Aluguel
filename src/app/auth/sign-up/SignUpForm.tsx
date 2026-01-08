"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { signUpAction } from "../actions";

export default function SignUpForm({ role }: { role: "TENANT" | "OWNER" }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    fd.set("role", role);

    const res = await signUpAction(fd);

    setLoading(false);

    if (!res?.ok) {
      setError(res?.error ?? "Erro ao cadastrar.");
      return;
    }

    router.push(res.redirectTo ?? `/auth/sign-in?role=${role}`);
  }

  return (
    <main style={{ maxWidth: 420, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>Criar conta</h1>
      <p style={{ opacity: 0.7, marginTop: 8 }}>Cadastre-se para continuar.</p>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12, marginTop: 16 }}>
        <input name="name" placeholder="Nome (opcional)" />
        <input name="email" type="email" placeholder="Email" required />
        <input name="password" type="password" placeholder="Senha" minLength={6} required />

        <button type="submit" disabled={loading}>
          {loading ? "Criando..." : "Criar conta"}
        </button>
      </form>

      {error && <p style={{ color: "crimson", marginTop: 12 }}>{error}</p>}

      <p style={{ marginTop: 16, fontSize: 14, opacity: 0.7 }}>
        Já tem conta? <a href={`/auth/sign-in?role=${role}`}>Entrar</a>
      </p>
    </main>
  );
}

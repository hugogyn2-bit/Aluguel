"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SignUpForm() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    const res = await fetch("/api/auth/sign-up", {
      method: "POST",
      body: formData,
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Erro ao criar conta.");
      return;
    }

    // ✅ redireciona para login com mensagem
    router.push("/auth/sign-in?created=1");
  }

  return (
    <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
      <input
        name="email"
        type="email"
        placeholder="E-mail"
        required
      />

      <input
        name="password"
        type="password"
        placeholder="Senha"
        required
      />

      <input
        name="birthDate"
        type="text"
        placeholder="Data de nascimento (DD/MM/AAAA)"
        required
      />

      <button type="submit" disabled={loading}>
        {loading ? "Criando..." : "Criar conta"}
      </button>

      {error && (
        <p style={{ color: "crimson", margin: 0 }}>{error}</p>
      )}
    </form>
  );
}

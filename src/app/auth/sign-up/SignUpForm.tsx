"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { signUpAction } from "../actions";

export function SignUpForm() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErr(null);

    const fd = new FormData(e.currentTarget);
    const res = await signUpAction(fd);

    setLoading(false);

    if (!res.ok) {
      setErr(res.error || "Não foi possível criar sua conta.");
      return;
    }

    // manda para o login com mensagem
    router.push(res.redirectTo || "/auth/sign-in?created=1");
  }

  return (
    <form onSubmit={onSubmit} style={{ display: "grid", gap: 12, marginTop: 16 }}>
      <input name="name" type="text" placeholder="Nome" />
      <input name="email" type="email" placeholder="Email" required />
      <input name="birthDate" type="text" placeholder="Data de nascimento (dd/mm/aaaa)" required />
      <input name="password" type="password" placeholder="Senha (mín. 6)" minLength={6} required />

      <button type="submit" disabled={loading}>
        {loading ? "Criando..." : "Criar conta (Proprietário)"}
      </button>

      {err ? <p style={{ color: "crimson" }}>{err}</p> : null}

      <p style={{ marginTop: 8, fontSize: 14, opacity: 0.7 }}>
        Já tem conta? <a href="/auth/sign-in">Entrar</a>
      </p>
    </form>
  );
}

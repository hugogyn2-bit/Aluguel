"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErr(null);

    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      birthDate: String(fd.get("birthDate") ?? ""),
      password: String(fd.get("password") ?? ""),
    };

    const res = await fetch("/api/auth/signup-owner", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      setErr(data?.error || "Erro ao criar conta.");
      return;
    }

    router.push("/auth/sign-in?created=1");
  }

  return (
    <main style={{ maxWidth: 420, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>Criar conta</h1>
      <p style={{ opacity: 0.7, marginTop: 8 }}>Crie sua conta para acessar o painel.</p>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12, marginTop: 16 }}>
        <input name="name" placeholder="Nome (opcional)" />
        <input name="email" type="email" placeholder="Email" required />
        <input name="birthDate" placeholder="Data de nascimento (DD/MM/AAAA)" required />
        <input name="password" type="password" placeholder="Senha" minLength={6} required />
        <button type="submit" disabled={loading}>{loading ? "Criando..." : "Criar conta"}</button>
        {err ? <p style={{ color: "crimson" }}>{err}</p> : null}
      </form>

      <p style={{ marginTop: 16, fontSize: 14, opacity: 0.7 }}>
        Já tem conta? <Link href="/auth/sign-in">Entrar</Link>
      </p>
    </main>
  );
}

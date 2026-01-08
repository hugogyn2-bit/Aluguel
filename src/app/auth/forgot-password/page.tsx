"use client";

import Link from "next/link";
import { useState } from "react";

export default function Page() {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    setOk(false);

    const fd = new FormData(e.currentTarget);
    const payload = {
      email: String(fd.get("email") ?? ""),
      birthDate: String(fd.get("birthDate") ?? ""),
      newPassword: String(fd.get("newPassword") ?? ""),
    };

    const res = await fetch("/api/auth/reset-owner", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      setErr(data?.error || "Erro ao alterar senha.");
      return;
    }

    setOk(true);
    (e.currentTarget as HTMLFormElement).reset();
  }

  return (
    <main style={{ maxWidth: 420, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>Recuperar senha</h1>
      <p style={{ opacity: 0.7, marginTop: 8 }}>
        Informe seu email e sua data de nascimento (DD/MM/AAAA).
      </p>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12, marginTop: 16 }}>
        <input name="email" type="email" placeholder="Email" required />
        <input name="birthDate" placeholder="Data de nascimento (DD/MM/AAAA)" required />
        <input name="newPassword" type="password" placeholder="Nova senha" minLength={6} required />
        <button type="submit" disabled={loading}>{loading ? "Salvando..." : "Alterar senha"}</button>
        {ok ? <p style={{ color: "green" }}>Senha alterada com sucesso.</p> : null}
        {err ? <p style={{ color: "crimson" }}>{err}</p> : null}
      </form>

      <p style={{ marginTop: 16, fontSize: 14, opacity: 0.7 }}>
        Voltar para <Link href="/auth/sign-in">login</Link>
      </p>
    </main>
  );
}

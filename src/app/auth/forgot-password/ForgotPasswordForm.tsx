"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ForgotPasswordForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    setOk(null);

    try {
      const fd = new FormData(e.currentTarget);
      const res = await fetch("/auth/forgot-password/submit", {
        method: "POST",
        body: fd,
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErr(data?.error || "Não foi possível redefinir a senha.");
        return;
      }

      setOk("Senha alterada! Faça login novamente.");
      setTimeout(() => router.push("/auth/sign-in?role=OWNER"), 800);
    } catch (e: any) {
      setErr(e?.message || "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ display: "grid", gap: 12, marginTop: 16 }}>
      <input name="email" type="email" placeholder="Seu email de OWNER" required />
      <input name="newPassword" type="password" placeholder="Nova senha" minLength={6} required />
      <button type="submit" disabled={loading}>
        {loading ? "Salvando..." : "Redefinir senha"}
      </button>

      {err ? <p style={{ color: "crimson" }}>{err}</p> : null}
      {ok ? <p style={{ color: "green" }}>{ok}</p> : null}
    </form>
  );
}

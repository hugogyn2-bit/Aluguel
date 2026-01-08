"use client";

import { useState } from "react";

export function TenantPasswordForm() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    setMsg(null);

    const fd = new FormData(e.currentTarget);
    const newPassword = String(fd.get("newPassword") ?? "");

    const res = await fetch("/api/tenant/change-password", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ newPassword }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      setErr(data?.error || "Erro.");
      return;
    }
    setMsg("Senha alterada com sucesso.");
    (e.currentTarget as HTMLFormElement).reset();
  }

  return (
    <section style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700 }}>Alterar senha</h2>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 10, marginTop: 12 }}>
        <input name="newPassword" type="password" placeholder="Nova senha" minLength={6} required />
        <button type="submit" disabled={loading}>
          {loading ? "Salvando..." : "Salvar"}
        </button>
        {msg ? <p style={{ color: "green" }}>{msg}</p> : null}
        {err ? <p style={{ color: "crimson" }}>{err}</p> : null}
      </form>
    </section>
  );
}

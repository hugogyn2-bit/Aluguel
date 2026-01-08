"use client";

import { useState } from "react";

export default function ChangePasswordClient() {
  const [loading, setLoading] = useState(false);
  const [okMsg, setOkMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setOkMsg(null);
    setErr(null);

    try {
      const fd = new FormData(e.currentTarget);
      const currentPassword = String(fd.get("currentPassword") ?? "");
      const newPassword = String(fd.get("newPassword") ?? "");
      const newPassword2 = String(fd.get("newPassword2") ?? "");

      if (newPassword !== newPassword2) {
        setErr("A confirmação da nova senha não confere.");
        return;
      }

      const res = await fetch("/api/tenant/change-password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(data?.error || `Erro (${res.status}) ao trocar senha.`);
        return;
      }

      (e.currentTarget as HTMLFormElement).reset();
      setOkMsg("Senha alterada com sucesso.");
    } catch (e: any) {
      setErr(e?.message || "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 520, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 26, fontWeight: 800 }}>Configurações</h1>
      <p style={{ opacity: 0.7, marginTop: 6 }}>Trocar senha do inquilino</p>

      <section style={{ marginTop: 18, border: "1px solid #e5e7eb", borderRadius: 12, padding: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>Alterar senha</h2>

        <form onSubmit={onSubmit} style={{ display: "grid", gap: 10, marginTop: 12 }}>
          <input
            name="currentPassword"
            type="password"
            placeholder="Senha atual"
            required
            style={inputStyle}
            autoComplete="current-password"
          />

          <input
            name="newPassword"
            type="password"
            placeholder="Nova senha (mín. 6)"
            minLength={6}
            required
            style={inputStyle}
            autoComplete="new-password"
          />

          <input
            name="newPassword2"
            type="password"
            placeholder="Confirmar nova senha"
            minLength={6}
            required
            style={inputStyle}
            autoComplete="new-password"
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              ...btnStyle,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Salvando..." : "Salvar nova senha"}
          </button>

          {okMsg ? <p style={{ color: "green", marginTop: 4 }}>{okMsg}</p> : null}
          {err ? <p style={{ color: "crimson", marginTop: 4 }}>{err}</p> : null}
        </form>
      </section>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  padding: 12,
  borderRadius: 10,
  border: "1px solid #d1d5db",
};

const btnStyle: React.CSSProperties = {
  padding: 12,
  borderRadius: 10,
  border: "1px solid #111827",
  background: "#111827",
  color: "white",
  fontWeight: 700,
};

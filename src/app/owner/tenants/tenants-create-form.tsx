"use client";

import { useState } from "react";

type Result =
  | { ok: true; tenantEmail: string; tempPassword: string }
  | { ok: false; error: string };

export default function TenantsCreateForm() {
  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState<Result | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setRes(null);

    const fd = new FormData(e.currentTarget);
    const payload = {
      email: String(fd.get("email") || "").trim().toLowerCase(),
      fullName: String(fd.get("fullName") || "").trim(),
      cpf: String(fd.get("cpf") || ""),
      rg: String(fd.get("rg") || ""),
      address: String(fd.get("address") || ""),
      cep: String(fd.get("cep") || ""),
    };

    try {
      const r = await fetch("/api/owner/tenants/create", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await r.json().catch(() => ({}));

      if (!r.ok) {
        setRes({ ok: false, error: data?.error || `Erro (${r.status})` });
        return;
      }

      setRes({ ok: true, tenantEmail: data.tenantEmail, tempPassword: data.tempPassword });
      e.currentTarget.reset();
    } catch (err: any) {
      setRes({ ok: false, error: err?.message || "Erro inesperado" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 16 }}>
      <h2 style={{ fontSize: 18, fontWeight: 800 }}>Criar inquilino</h2>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 10, marginTop: 12 }}>
        <input name="email" type="email" placeholder="Email do inquilino" required />
        <input name="fullName" placeholder="Nome completo" required />
        <input name="cpf" placeholder="CPF (somente números ou com pontuação)" required />
        <input name="rg" placeholder="RG" required />
        <input name="address" placeholder="Endereço" required />
        <input name="cep" placeholder="CEP" required />

        <button type="submit" disabled={loading} style={{ padding: 12, borderRadius: 10 }}>
          {loading ? "Criando..." : "Criar inquilino"}
        </button>
      </form>

      {res?.ok ? (
        <div style={{ marginTop: 14, padding: 12, borderRadius: 10, background: "#f0fdf4" }}>
          <div style={{ fontWeight: 800 }}>✅ Inquilino criado</div>
          <div style={{ marginTop: 6 }}>
            <b>Email:</b> {res.tenantEmail}
          </div>
          <div style={{ marginTop: 6 }}>
            <b>Senha temporária:</b> <code>{res.tempPassword}</code>
          </div>
          <div style={{ marginTop: 6, opacity: 0.75, fontSize: 13 }}>
            O inquilino entra em <code>/auth/sign-in</code> com o e-mail e a senha temporária. Depois ele pode trocar a senha.
          </div>
        </div>
      ) : res?.ok === false ? (
        <p style={{ marginTop: 12, color: "crimson" }}>❌ {res.error}</p>
      ) : null}
    </section>
  );
}

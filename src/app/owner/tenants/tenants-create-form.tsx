"use client";

import { useState } from "react";

type CreatedTenant = {
  id: string;
  email: string;
  fullName: string;
  cpf: string;
  rg: string;
  address: string;
  cep: string;
};

export function TenantsCreateForm() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    setMsg(null);

    const fd = new FormData(e.currentTarget);
    const payload = {
      email: String(fd.get("email") ?? ""),
      fullName: String(fd.get("fullName") ?? ""),
      cpf: String(fd.get("cpf") ?? ""),
      rg: String(fd.get("rg") ?? ""),
      address: String(fd.get("address") ?? ""),
      cep: String(fd.get("cep") ?? ""),
    };

    const res = await fetch("/api/owner/tenants/create", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));

    setLoading(false);

    if (!res.ok) {
      setErr(data?.error || "Erro ao criar inquilino.");
      return;
    }

    const tempPassword = data?.tempPassword || "";
    setMsg(`Inquilino criado! Senha padrão (CPF): ${tempPassword}`);
    (e.currentTarget as HTMLFormElement).reset();

    // avisa lista pra recarregar
    window.dispatchEvent(new Event("tenants:refresh"));
  }

  return (
    <section style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700 }}>Criar inquilino</h2>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 10, marginTop: 12 }}>
        <input name="email" type="email" placeholder="Email do inquilino" required />
        <input name="fullName" placeholder="Nome completo" required />

        <input
          name="cpf"
          placeholder="CPF (11 números)"
          required
          maxLength={11}
          inputMode="numeric"
          pattern="\d{11}"
          title="Digite 11 números"
        />

        <input name="rg" placeholder="RG" required />
        <input name="address" placeholder="Endereço" required />

        <input
          name="cep"
          placeholder="CEP"
          required
          maxLength={8}
          inputMode="numeric"
          pattern="\d{8}"
          title="Digite 8 números"
        />

        <button type="submit" disabled={loading}>
          {loading ? "Criando..." : "Criar inquilino"}
        </button>

        {msg ? <p style={{ color: "green" }}>{msg}</p> : null}
        {err ? <p style={{ color: "crimson" }}>{err}</p> : null}
      </form>
    </section>
  );
}

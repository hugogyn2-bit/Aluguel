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
      email: String(fd.get("email") ?? "").trim().toLowerCase(),
      fullName: String(fd.get("fullName") ?? "").trim(),
      cpf: String(fd.get("cpf") ?? "").trim(),
      rg: String(fd.get("rg") ?? "").trim(),
      address: String(fd.get("address") ?? "").trim(),
      cep: String(fd.get("cep") ?? "").trim(),
    };

    try {
      const r = await fetch("/api/owner/tenants/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await r.json().catch(() => ({}));

      if (!r.ok) {
        setRes({ ok: false, error: data?.error || `Erro (${r.status})` });
        return;
      }

      setRes({ ok: true, tenantEmail: data.tenantEmail, tempPassword: data.tempPassword });
      (e.currentTarget as HTMLFormElement).reset();

      // força lista atualizar
      window.dispatchEvent(new Event("tenants:refresh"));
    } catch (err: any) {
      setRes({ ok: false, error: err?.message || "Erro inesperado" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="border rounded-xl p-4">
      <h2 className="font-semibold">Criar inquilino</h2>

      <form onSubmit={onSubmit} className="grid gap-3 mt-4">
        <div className="grid gap-2">
          <label className="text-sm">Email (login do inquilino)</label>
          <input name="email" required className="border rounded p-2" placeholder="inquilino@email.com" />
        </div>

        <div className="grid gap-2">
          <label className="text-sm">Nome completo</label>
          <input name="fullName" required className="border rounded p-2" placeholder="Nome completo" />
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <div className="grid gap-2">
            <label className="text-sm">CPF</label>
            <input name="cpf" required className="border rounded p-2" placeholder="000.000.000-00" />
          </div>
          <div className="grid gap-2">
            <label className="text-sm">RG</label>
            <input name="rg" required className="border rounded p-2" placeholder="RG" />
          </div>
        </div>

        <div className="grid gap-2">
          <label className="text-sm">Endereço</label>
          <input name="address" required className="border rounded p-2" placeholder="Rua, número, bairro, cidade/UF" />
        </div>

        <div className="grid gap-2">
          <label className="text-sm">CEP</label>
          <input name="cep" required className="border rounded p-2" placeholder="00000-000" />
        </div>

        <button disabled={loading} className="rounded bg-black text-white p-2">
          {loading ? "Criando..." : "Criar inquilino"}
        </button>
      </form>

      {res?.ok ? (
        <div className="mt-4 rounded border p-3 text-sm">
          <div>
            Inquilino criado: <b>{res.tenantEmail}</b>
          </div>
          <div>
            Senha temporária: <b>{res.tempPassword}</b>
          </div>
          <div className="text-gray-600 mt-2">
            Envie esses dados para o inquilino. Ele poderá trocar a senha depois (quando criarmos a tela de trocar senha).
          </div>
        </div>
      ) : null}

      {res && !res.ok ? <p className="text-sm text-red-600 mt-3">{res.error}</p> : null}
    </section>
  );
}

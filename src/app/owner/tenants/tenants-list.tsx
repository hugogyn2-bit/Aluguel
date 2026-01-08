"use client";

import { useEffect, useState } from "react";

type Tenant = {
  id: string;
  fullName: string;
  cpf: string;
  rg: string;
  address: string;
  cep: string;
  createdAt: string;
  user: { email: string; id: string };
};

export default function TenantsList() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const r = await fetch("/api/owner/tenants/list", { cache: "no-store" });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        setErr(data?.error || `Erro (${r.status})`);
        setTenants([]);
        return;
      }
      setTenants(data.tenants || []);
    } catch (e: any) {
      setErr(e?.message || "Erro inesperado");
      setTenants([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const fn = () => load();
    window.addEventListener("tenants:refresh", fn);
    return () => window.removeEventListener("tenants:refresh", fn);
  }, []);

  return (
    <section className="border rounded-xl p-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-semibold">Lista de inquilinos</h2>
        <button onClick={load} className="text-sm underline">
          Atualizar
        </button>
      </div>

      {loading ? <p className="text-sm text-gray-600 mt-3">Carregando...</p> : null}
      {err ? <p className="text-sm text-red-600 mt-3">{err}</p> : null}

      {!loading && !err && tenants.length === 0 ? (
        <p className="text-sm text-gray-600 mt-3">Nenhum inquilino cadastrado ainda.</p>
      ) : null}

      {!loading && !err && tenants.length > 0 ? (
        <div className="mt-4 grid gap-3">
          {tenants.map((t) => (
            <div key={t.id} className="rounded border p-3 text-sm">
              <div className="font-semibold">{t.fullName}</div>
              <div className="text-gray-700">{t.user.email}</div>
              <div className="text-gray-600 mt-1">
                CPF: {t.cpf} • RG: {t.rg}
              </div>
              <div className="text-gray-600">CEP: {t.cep}</div>
              <div className="text-gray-600">{t.address}</div>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}

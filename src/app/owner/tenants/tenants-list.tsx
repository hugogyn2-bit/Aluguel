"use client";

import { useEffect, useState } from "react";

type TenantItem = {
  id: string;
  email: string;
  fullName: string;
  cpf: string;
  rg: string;
  address: string;
  cep: string;
  createdAt: string;
};

export function TenantsList() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [items, setItems] = useState<TenantItem[]>([]);

  async function load() {
    setLoading(true);
    setErr(null);
    const res = await fetch("/api/owner/tenants/list");
    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      setErr(data?.error || "Erro ao carregar.");
      return;
    }
    setItems(data?.tenants || []);
  }

  useEffect(() => {
    load();
    const onRefresh = () => load();
    window.addEventListener("tenants:refresh", onRefresh);
    return () => window.removeEventListener("tenants:refresh", onRefresh);
  }, []);

  return (
    <section style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700 }}>Lista</h2>

      {loading ? <p style={{ opacity: 0.7, marginTop: 8 }}>Carregando...</p> : null}
      {err ? <p style={{ color: "crimson", marginTop: 8 }}>{err}</p> : null}

      {!loading && !err && items.length === 0 ? (
        <p style={{ opacity: 0.7, marginTop: 8 }}>Nenhum inquilino cadastrado.</p>
      ) : null}

      <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
        {items.map((t) => (
          <div key={t.id} style={{ border: "1px solid #eee", borderRadius: 10, padding: 12 }}>
            <div style={{ fontWeight: 700 }}>{t.fullName}</div>
            <div style={{ fontSize: 14, opacity: 0.75 }}>{t.email}</div>
            <div style={{ fontSize: 13, opacity: 0.75, marginTop: 6 }}>
              CPF: {t.cpf} • RG: {t.rg} • CEP: {t.cep}
            </div>
            <div style={{ fontSize: 13, opacity: 0.75 }}>Endereço: {t.address}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

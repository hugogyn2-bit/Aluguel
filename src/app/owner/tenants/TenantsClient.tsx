"use client";

import { useEffect, useMemo, useState } from "react";

type Tenant = {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
};

export default function TenantsClient() {
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  const [tenants, setTenants] = useState<Tenant[]>([]);

  async function loadTenants() {
    setListLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/owner/tenants/list", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || `Erro (${res.status}) ao listar.`);
      setTenants((data?.tenants ?? []).map((t: any) => ({ ...t, createdAt: t.createdAt })));
    } catch (e: any) {
      setError(e?.message || "Erro ao listar inquilinos.");
    } finally {
      setListLoading(false);
    }
  }

  useEffect(() => {
    loadTenants();
  }, []);

  async function onCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setOkMsg(null);

    try {
      const fd = new FormData(e.currentTarget);
      const payload = {
        name: String(fd.get("name") ?? "").trim() || undefined,
        email: String(fd.get("email") ?? "").trim().toLowerCase(),
        password: String(fd.get("password") ?? ""),
      };

      const res = await fetch("/api/owner/tenants/create", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error || `Erro (${res.status}) ao criar.`);
      }

      setOkMsg("Inquilino criado com sucesso.");
      (e.currentTarget as HTMLFormElement).reset();

      await loadTenants();
    } catch (e: any) {
      setError(e?.message || "Erro ao criar inquilino.");
    } finally {
      setLoading(false);
    }
  }

  const count = useMemo(() => tenants.length, [tenants]);

  return (
    <main style={{ maxWidth: 720, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 26, fontWeight: 800 }}>Inquilinos</h1>
      <p style={{ opacity: 0.7, marginTop: 6 }}>
        Crie acessos de inquilino (a senha inicial é definida por você).
      </p>

      <section style={{ marginTop: 18, border: "1px solid #e5e7eb", borderRadius: 12, padding: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>Criar novo inquilino</h2>

        <form onSubmit={onCreate} style={{ display: "grid", gap: 10, marginTop: 12 }}>
          <input
            name="name"
            placeholder="Nome (opcional)"
            style={inputStyle}
            autoComplete="name"
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            required
            style={inputStyle}
            autoComplete="email"
          />
          <input
            name="password"
            type="password"
            placeholder="Senha inicial (mín. 6)"
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
            {loading ? "Criando..." : "Criar inquilino"}
          </button>

          {okMsg ? <p style={{ color: "green", marginTop: 4 }}>{okMsg}</p> : null}
          {error ? <p style={{ color: "crimson", marginTop: 4 }}>{error}</p> : null}
        </form>
      </section>

      <section style={{ marginTop: 18, border: "1px solid #e5e7eb", borderRadius: 12, padding: 16 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>Seus inquilinos</h2>
          <span style={{ opacity: 0.7, fontSize: 14 }}>{count} no total</span>
        </div>

        {listLoading ? (
          <p style={{ marginTop: 12, opacity: 0.7 }}>Carregando...</p>
        ) : tenants.length === 0 ? (
          <p style={{ marginTop: 12, opacity: 0.7 }}>Nenhum inquilino cadastrado ainda.</p>
        ) : (
          <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
            {tenants.map((t) => (
              <div
                key={t.id}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 12,
                  padding: 12,
                  display: "grid",
                  gap: 6,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <strong>{t.name || "Sem nome"}</strong>
                  <span style={{ opacity: 0.7, fontSize: 12 }}>
                    {new Date(t.createdAt).toLocaleString()}
                  </span>
                </div>
                <div style={{ opacity: 0.85 }}>{t.email}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      <p style={{ marginTop: 16, fontSize: 13, opacity: 0.7 }}>
        Dica: o inquilino pode trocar a senha depois (endpoint /api/tenant/change-password).
      </p>
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

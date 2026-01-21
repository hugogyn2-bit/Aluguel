"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Tenant = {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
};

export default function OwnerTenantsPage() {
  const [loading, setLoading] = useState(true);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [error, setError] = useState("");

  async function loadTenants() {
    setLoading(true);
    setError("");

    try {
      // ✅ Ajuste aqui se sua API for outra
      const res = await fetch("/api/owner/tenants/list");
      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "Erro ao carregar inquilinos");
        setTenants([]);
        return;
      }

      setTenants(data?.tenants || []);
    } catch (err) {
      setError("Erro interno ao carregar inquilinos.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTenants();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white px-6 py-12">
      <div className="mx-auto max-w-4xl rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h1 className="text-3xl font-extrabold">👥 Meus Inquilinos</h1>

          <Link
            href="/owner/tenants/create"
            className="rounded-xl px-4 py-3 bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-purple-600 font-semibold hover:opacity-95"
          >
            ➕ Novo Inquilino
          </Link>
        </div>

        <p className="text-white/60 mt-2">
          Lista de inquilinos cadastrados no seu sistema.
        </p>

        {loading ? (
          <div className="mt-8 text-white/70">Carregando...</div>
        ) : error ? (
          <div className="mt-8 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">
            {error}
          </div>
        ) : tenants.length === 0 ? (
          <div className="mt-8 rounded-xl border border-white/10 bg-white/5 p-6 text-white/70">
            Nenhum inquilino cadastrado ainda.
          </div>
        ) : (
          <div className="mt-8 space-y-3">
            {tenants.map((t) => (
              <div
                key={t.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 transition"
              >
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <p className="text-lg font-bold">{t.name}</p>
                    <p className="text-white/60 text-sm">{t.email}</p>
                  </div>

                  <Link
                    href={`/owner/tenants/${t.id}`}
                    className="rounded-xl px-4 py-2 bg-white/10 border border-white/10 hover:bg-white/15 transition text-sm"
                  >
                    Ver detalhes →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-10 flex gap-3 flex-wrap">
          <Link
            href="/owner/dashboard"
            className="rounded-xl px-4 py-3 bg-white/10 border border-white/10 hover:bg-white/15 transition"
          >
            ← Voltar Dashboard
          </Link>

          <Link
            href="/owner"
            className="rounded-xl px-4 py-3 bg-white/10 border border-white/10 hover:bg-white/15 transition"
          >
            ← Área do Proprietário
          </Link>
        </div>
      </div>
    </div>
  );
}

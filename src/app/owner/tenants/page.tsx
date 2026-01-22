"use client";

import { useEffect, useState } from "react";

type Tenant = {
  id: string;
  fullName: string;
  cpf: string;
  rg: string;
  phone: string;
  address: string;
  cep: string;
  createdAt: string;
  user: {
    id: string;
    email: string;
    mustChangePassword: boolean;
    createdAt: string;
  };
};

export default function OwnerTenantsPage() {
  const [loading, setLoading] = useState(true);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function loadTenants() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/owner/tenants/list");
      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "Erro ao carregar inquilinos");
        setTenants([]);
        return;
      }

      setTenants(data.tenants || []);
    } catch {
      setError("Erro interno ao carregar.");
      setTenants([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTenants();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Carregando inquilinos...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 py-10">
      <div className="mx-auto w-full max-w-5xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold">Meus Inquilinos</h1>
            <p className="text-white/60 text-sm mt-1">
              Aqui você vê todos os inquilinos cadastrados no seu sistema.
            </p>
          </div>

          <div className="flex gap-3">
            <a
              href="/owner/tenants/create"
              className="rounded-xl bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-purple-600 px-4 py-3 font-semibold hover:opacity-95"
            >
              ➕ Novo Inquilino
            </a>

            <button
              onClick={loadTenants}
              className="rounded-xl bg-white/10 border border-white/10 px-4 py-3 font-semibold hover:bg-white/15"
            >
              🔄 Atualizar
            </button>
          </div>
        </div>

        {error ? (
          <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-red-200">
            {error}
          </div>
        ) : null}

        <div className="mt-8 grid gap-4">
          {tenants.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/70">
              Nenhum inquilino cadastrado ainda.
            </div>
          ) : (
            tenants.map((t) => (
              <div
                key={t.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold">{t.fullName}</h2>
                    <p className="text-white/60 text-sm mt-1">
                      Email: <span className="text-white">{t.user.email}</span>
                    </p>

                    <p className="text-white/60 text-sm mt-1">
                      CPF: <span className="text-white">{t.cpf}</span> • RG:{" "}
                      <span className="text-white">{t.rg}</span>
                    </p>

                    <p className="text-white/60 text-sm mt-1">
                      Telefone: <span className="text-white">{t.phone}</span>
                    </p>

                    <p className="text-white/60 text-sm mt-1">
                      Endereço: <span className="text-white">{t.address}</span>
                    </p>

                    <p className="text-white/60 text-sm mt-1">
                      CEP: <span className="text-white">{t.cep}</span>
                    </p>
                  </div>

                  <div className="text-sm text-white/60">
                    <div className="rounded-xl border border-white/10 bg-black/40 px-4 py-3">
                      <p>
                        Login criado em:{" "}
                        <span className="text-white">
                          {new Date(t.user.createdAt).toLocaleString()}
                        </span>
                      </p>

                      <p className="mt-2">
                        Trocar senha no login?{" "}
                        {t.user.mustChangePassword ? (
                          <span className="text-yellow-300 font-semibold">SIM</span>
                        ) : (
                          <span className="text-green-300 font-semibold">NÃO</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-10 text-white/40 text-xs">
          ✅ Dica: o inquilino entra com senha <b>123456</b> e será obrigado a trocar no primeiro login.
        </div>
      </div>
    </div>
  );
}

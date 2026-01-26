"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Contract = {
  id: string;
  status: string;
  createdAt: string;
  rentValueCents: number;

  tenantProfile: {
    fullName: string;
    city: string;
  };
};

function statusLabel(status: string) {
  switch (status) {
    case "DRAFT":
      return "Rascunho";
    case "PENDING_SIGNATURES":
      return "Pendente assinaturas";
    case "ACTIVE":
      return "Ativo";
    case "CANCELLED":
      return "Cancelado";
    default:
      return status;
  }
}

function statusColor(status: string) {
  switch (status) {
    case "ACTIVE":
      return "text-green-400";
    case "PENDING_SIGNATURES":
      return "text-yellow-300";
    case "CANCELLED":
      return "text-red-400";
    default:
      return "text-white";
  }
}

export default function OwnerContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadContracts() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/owner/contracts");
      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "Erro ao carregar contratos");
        setContracts([]);
        return;
      }

      setContracts(data.contracts || []);
    } catch {
      setError("Erro interno ao carregar contratos");
      setContracts([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadContracts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Carregando contratos...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 py-10">
      <div className="mx-auto w-full max-w-5xl">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold">📑 Contratos</h1>
            <p className="text-white/60 text-sm mt-1">
              Lista de contratos de locação cadastrados.
            </p>
          </div>

          <Link
            href="/owner"
            className="rounded-xl bg-white/10 border border-white/10 px-4 py-3 font-semibold hover:bg-white/15"
          >
            ⬅️ Voltar ao painel
          </Link>
        </div>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-red-200">
            {error}
          </div>
        )}

        {/* LISTA */}
        <div className="mt-8 grid gap-4">
          {contracts.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/70">
              Nenhum contrato encontrado.
            </div>
          ) : (
            contracts.map((c) => (
              <div
                key={c.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* INFO */}
                  <div>
                    <h2 className="text-lg font-bold">
                      {c.tenantProfile.fullName}
                    </h2>

                    <p className="text-white/60 text-sm mt-1">
                      Cidade:{" "}
                      <span className="text-white">
                        {c.tenantProfile.city}
                      </span>
                    </p>

                    <p className="text-white/60 text-sm mt-1">
                      Criado em:{" "}
                      <span className="text-white">
                        {new Date(c.createdAt).toLocaleDateString("pt-BR")}
                      </span>
                    </p>

                    <p className="text-white/60 text-sm mt-1">
                      Valor:{" "}
                      <span className="text-white">
                        {(c.rentValueCents / 100).toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </span>
                    </p>

                    <p
                      className={`text-sm mt-2 font-semibold ${statusColor(
                        c.status
                      )}`}
                    >
                      Status: {statusLabel(c.status)}
                    </p>
                  </div>

                  {/* ACTIONS */}
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href={`/owner/contracts/${c.id}`}
                      className="rounded-xl bg-white/10 border border-white/10 px-4 py-2 font-semibold hover:bg-white/15"
                    >
                      📄 Ver contrato
                    </Link>

                    <a
                      href={`/api/contracts/${c.id}/pdf`}
                      target="_blank"
                      className="rounded-xl bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-purple-600 px-4 py-2 font-semibold hover:opacity-95"
                    >
                      ⬇️ PDF
                    </a>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-10 text-white/40 text-xs">
          ✅ Dica: contratos ficam <b>Ativos</b> quando ambas as assinaturas são feitas.
        </div>
      </div>
    </div>
  );
}

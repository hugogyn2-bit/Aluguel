"use client";

import { useEffect, useState } from "react";

type Contract = {
  id: string;
  status: "DRAFT" | "PENDING_SIGNATURES" | "ACTIVE" | "CANCELLED";
  signedCity: string;
  signedAtDate: string;
  rentValueCents: number;

  ownerSignedAt: string | null;
  tenantSignedAt: string | null;

  tenantProfile: {
    id: string;
    fullName: string;
    cpf: string;
    email: string;
    phone: string;
    city: string;

    user: {
      email: string;
    };
  };
};

function formatMoneyBR(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function statusLabel(status: Contract["status"]) {
  if (status === "DRAFT") return "Rascunho";
  if (status === "PENDING_SIGNATURES") return "Pendente assinaturas";
  if (status === "ACTIVE") return "Ativo";
  if (status === "CANCELLED") return "Cancelado";
  return status;
}

export default function OwnerContractsPage() {
  const [loading, setLoading] = useState(true);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function loadContracts() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/owner/contracts/list");
      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "Erro ao carregar contratos");
        setContracts([]);
        return;
      }

      setContracts(data.contracts || []);
    } catch {
      setError("Erro interno ao carregar contratos.");
      setContracts([]);
    } finally {
      setLoading(false);
    }
  }

  async function ownerSign(contractId: string) {
    try {
      const signatureDataUrl = "data:image/png;base64,ASSINATURA_FAKE"; // ⚠️ você vai trocar pelo desenho real
      const res = await fetch(`/api/owner/contracts/${contractId}/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signatureDataUrl }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data?.error || "Erro ao assinar contrato");
        return;
      }

      alert("✅ Contrato assinado pelo proprietário!");
      loadContracts();
    } catch {
      alert("Erro interno ao assinar.");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Carregando contratos...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 py-10">
      <div className="mx-auto w-full max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold">📄 Contratos</h1>
            <p className="text-white/60 text-sm mt-1">
              Lista de contratos gerados para seus inquilinos.
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
              onClick={loadContracts}
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
          {contracts.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/70">
              Nenhum contrato criado ainda.
            </div>
          ) : (
            contracts.map((c) => (
              <div
                key={c.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                  <div>
                    <h2 className="text-xl font-extrabold">
                      {c.tenantProfile.fullName}
                    </h2>

                    <p className="text-white/60 text-sm mt-1">
                      Cidade: <span className="text-white">{c.tenantProfile.city}</span>
                    </p>

                    <p className="text-white/60 text-sm mt-1">
                      Aluguel:{" "}
                      <span className="text-white">
                        {formatMoneyBR(c.rentValueCents)}
                      </span>
                    </p>

                    <p className="text-white/60 text-sm mt-1">
                      Status:{" "}
                      <span className="text-white font-semibold">
                        {statusLabel(c.status)}
                      </span>
                    </p>

                    <div className="mt-3 text-sm text-white/60">
                      <p>
                        Assinado locador?{" "}
                        {c.ownerSignedAt ? (
                          <span className="text-green-300 font-semibold">SIM</span>
                        ) : (
                          <span className="text-yellow-300 font-semibold">NÃO</span>
                        )}
                      </p>

                      <p>
                        Assinado inquilino?{" "}
                        {c.tenantSignedAt ? (
                          <span className="text-green-300 font-semibold">SIM</span>
                        ) : (
                          <span className="text-yellow-300 font-semibold">NÃO</span>
                        )}
                      </p>
                    </div>

                    <p className="mt-3 text-xs text-white/40">
                      ID do contrato: {c.id}
                    </p>
                  </div>

                  {/* BOTÕES */}
                  <div className="flex flex-col gap-3 min-w-[240px]">
                    <a
                      href={`/owner/contracts/${c.id}`}
                      className="rounded-xl bg-white/10 border border-white/10 px-4 py-3 font-semibold hover:bg-white/15 text-center"
                    >
                      👁️ Ver contrato
                    </a>

                    <button
                      onClick={() => ownerSign(c.id)}
                      className="rounded-xl bg-gradient-to-r from-fuchsia-500 to-purple-600 px-4 py-3 font-semibold hover:opacity-95"
                    >
                      ✍️ Assinar (Locador)
                    </button>

                    <a
                      href={`/api/owner/contracts/${c.id}/pdf`}
                      target="_blank"
                      className="rounded-xl bg-white/10 border border-white/10 px-4 py-3 font-semibold hover:bg-white/15 text-center"
                    >
                      📄 PDF
                    </a>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-10 text-white/40 text-xs">
          ✅ Dica: depois que ambos assinarem, você pode mudar o status do contrato para <b>ACTIVE</b>.
        </div>
      </div>
    </div>
  );
}

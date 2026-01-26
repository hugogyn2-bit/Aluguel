"use client";

import { useEffect, useState } from "react";

type ContractStatus = "DRAFT" | "PENDING_SIGNATURES" | "ACTIVE" | "CANCELLED";

type Contract = {
  id: string;
  status: ContractStatus;
  createdAt: string;

  ownerSignedAt: string | null;
  tenantSignedAt: string | null;

  tenantProfile: {
    id: string;
    fullName: string;
    cpf: string;
    rg: string;
    email: string;
    phone: string;
    city: string;
    address: string;
    cep: string;
    rentValueCents: number;
    createdAt: string;
  };
};

function statusLabel(status: ContractStatus) {
  if (status === "DRAFT") return "Rascunho";
  if (status === "PENDING_SIGNATURES") return "Aguardando assinaturas";
  if (status === "ACTIVE") return "Ativo";
  if (status === "CANCELLED") return "Cancelado";
  return status;
}

function moneyBR(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function OwnerContractsPage() {
  const [loading, setLoading] = useState(true);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function loadContracts() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/owner/contracts/list", {
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        setContracts([]);
        setError(data?.error || "Erro ao carregar contratos");
        return;
      }

      setContracts(data.contracts || []);
    } catch {
      setContracts([]);
      setError("Erro interno ao carregar contratos.");
    } finally {
      setLoading(false);
    }
  }

  async function ownerSign(contractId: string) {
    try {
      // ⚠️ assinatura simples (texto)
      // se você já tem assinatura desenhada no front depois eu adapto
      const signatureDataUrl = "ASSINADO_PELO_PROPRIETARIO";

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

      alert("✅ Contrato assinado com sucesso!");
      loadContracts();
    } catch {
      alert("Erro interno ao assinar.");
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
      <div className="mx-auto w-full max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold">📄 Contratos</h1>
            <p className="text-white/60 text-sm mt-1">
              Aqui você vê todos os contratos gerados para seus inquilinos.
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
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold">
                      {c.tenantProfile.fullName}
                    </h2>

                    <p className="text-white/60 text-sm mt-1">
                      Status:{" "}
                      <span className="text-white font-semibold">
                        {statusLabel(c.status)}
                      </span>
                    </p>

                    <p className="text-white/60 text-sm mt-1">
                      Aluguel:{" "}
                      <span className="text-white font-semibold">
                        {moneyBR(c.tenantProfile.rentValueCents)}
                      </span>
                    </p>

                    <p className="text-white/60 text-sm mt-1">
                      Email:{" "}
                      <span className="text-white">{c.tenantProfile.email}</span>
                    </p>

                    <p className="text-white/60 text-sm mt-1">
                      CPF: <span className="text-white">{c.tenantProfile.cpf}</span>{" "}
                      • RG: <span className="text-white">{c.tenantProfile.rg}</span>
                    </p>

                    <p className="text-white/60 text-sm mt-1">
                      Endereço:{" "}
                      <span className="text-white">
                        {c.tenantProfile.address} • {c.tenantProfile.city}
                      </span>
                    </p>

                    <p className="text-white/60 text-sm mt-1">
                      Criado em:{" "}
                      <span className="text-white">
                        {new Date(c.createdAt).toLocaleString("pt-BR")}
                      </span>
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 w-full md:w-[260px]">
                    <div className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white/70">
                      <div>
                        Ass. Proprietário:{" "}
                        {c.ownerSignedAt ? (
                          <span className="text-green-300 font-semibold">
                            ✅ OK
                          </span>
                        ) : (
                          <span className="text-yellow-300 font-semibold">
                            ⏳ Pendente
                          </span>
                        )}
                      </div>

                      <div className="mt-1">
                        Ass. Inquilino:{" "}
                        {c.tenantSignedAt ? (
                          <span className="text-green-300 font-semibold">
                            ✅ OK
                          </span>
                        ) : (
                          <span className="text-yellow-300 font-semibold">
                            ⏳ Pendente
                          </span>
                        )}
                      </div>
                    </div>

                    <a
                      href={`/owner/contracts/${c.id}`}
                      className="rounded-xl bg-white/10 border border-white/10 px-4 py-3 font-semibold hover:bg-white/15 text-center"
                    >
                      👁️ Ver contrato
                    </a>

                    <button
                      onClick={() => ownerSign(c.id)}
                      className="rounded-xl bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-purple-600 px-4 py-3 font-semibold hover:opacity-95"
                    >
                      ✍️ Assinar (Owner)
                    </button>

                    <a
                      href={`/api/owner/contracts/${c.id}/pdf`}
                      target="_blank"
                      className="rounded-xl bg-white/10 border border-white/10 px-4 py-3 font-semibold hover:bg-white/15 text-center"
                      rel="noreferrer"
                    >
                      ⬇️ PDF
                    </a>
                  </div>
                </div>

                <div className="mt-4 text-xs text-white/40">
                  ID do contrato: <span className="text-white/60">{c.id}</span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-10 text-white/40 text-xs">
          ✅ Se o botão PDF der erro, me manda o log (eu já arrumo o endpoint).
        </div>
      </div>
    </div>
  );
}

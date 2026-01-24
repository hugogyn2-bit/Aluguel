"use client";

import { useEffect, useState } from "react";

type Contract = {
  id: string;
  status: "DRAFT" | "PENDING_SIGNATURES" | "ACTIVE" | "CANCELLED";

  contractText: string;
  signedCity: string;
  signedAtDate: string;

  rentValueCents: number;

  ownerSignatureDataUrl: string | null;
  ownerSignedAt: string | null;

  tenantSignatureDataUrl: string | null;
  tenantSignedAt: string | null;

  tenantProfile: {
    id: string;
    fullName: string;
    cpf: string;
    rg: string;
    email: string;
    phone: string;
    address: string;
    cep: string;
    city: string;

    user: {
      id: string;
      email: string;
    };
  };

  owner: {
    id: string;
    name: string | null;
    email: string;
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

export default function OwnerContractViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [id, setId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [contract, setContract] = useState<Contract | null>(null);
  const [error, setError] = useState<string | null>(null);

  // assinatura fake só pra teste (depois você troca pelo seu canvas real)
  const [signatureDataUrl, setSignatureDataUrl] = useState<string>("");

  useEffect(() => {
    (async () => {
      const p = await params;
      setId(p.id);
    })();
  }, [params]);

  async function loadContract(contractId: string) {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/owner/contracts/${contractId}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "Erro ao carregar contrato");
        setContract(null);
        return;
      }

      setContract(data.contract);
    } catch {
      setError("Erro interno ao carregar contrato.");
      setContract(null);
    } finally {
      setLoading(false);
    }
  }

  async function signOwner() {
    if (!id) return;

    if (!signatureDataUrl || !signatureDataUrl.startsWith("data:image")) {
      alert("Cole uma assinatura válida (data:image/...) para testar.");
      return;
    }

    try {
      const res = await fetch(`/api/owner/contracts/${id}/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signatureDataUrl }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data?.error || "Erro ao assinar contrato");
        return;
      }

      alert("✅ Contrato assinado como LOCADOR!");
      loadContract(id);
    } catch {
      alert("Erro interno ao assinar.");
    }
  }

  useEffect(() => {
    if (!id) return;
    loadContract(id);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Carregando contrato...
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="min-h-screen bg-black text-white px-4 py-10">
        <div className="mx-auto w-full max-w-4xl">
          <h1 className="text-2xl font-extrabold">Contrato</h1>
          <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-red-200">
            {error || "Contrato não encontrado"}
          </div>

          <div className="mt-6">
            <a
              href="/owner/contracts"
              className="rounded-xl bg-white/10 border border-white/10 px-4 py-3 font-semibold hover:bg-white/15 inline-block"
            >
              ⬅ Voltar
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 py-10">
      <div className="mx-auto w-full max-w-5xl">
        {/* topo */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold">📄 Contrato</h1>
            <p className="text-white/60 text-sm mt-1">
              Inquilino:{" "}
              <span className="text-white font-semibold">
                {contract.tenantProfile.fullName}
              </span>
            </p>
            <p className="text-white/60 text-sm mt-1">
              Status:{" "}
              <span className="text-white font-semibold">
                {statusLabel(contract.status)}
              </span>
            </p>
          </div>

          <div className="flex gap-3">
            <a
              href="/owner/contracts"
              className="rounded-xl bg-white/10 border border-white/10 px-4 py-3 font-semibold hover:bg-white/15"
            >
              ⬅ Voltar
            </a>

            <a
              href={`/api/owner/contracts/${contract.id}/pdf`}
              target="_blank"
              className="rounded-xl bg-white/10 border border-white/10 px-4 py-3 font-semibold hover:bg-white/15"
            >
              📄 PDF
            </a>
          </div>
        </div>

        {/* card dados */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <div className="grid gap-4 md:grid-cols-2 text-sm text-white/70">
            <div>
              <div className="text-white font-bold mb-2">Dados do inquilino</div>
              <p>
                Email: <span className="text-white">{contract.tenantProfile.email}</span>
              </p>
              <p>
                CPF: <span className="text-white">{contract.tenantProfile.cpf}</span>
              </p>
              <p>
                RG: <span className="text-white">{contract.tenantProfile.rg}</span>
              </p>
              <p>
                Telefone:{" "}
                <span className="text-white">{contract.tenantProfile.phone}</span>
              </p>
            </div>

            <div>
              <div className="text-white font-bold mb-2">Contrato</div>
              <p>
                Cidade: <span className="text-white">{contract.signedCity}</span>
              </p>
              <p>
                Aluguel:{" "}
                <span className="text-white">
                  {formatMoneyBR(contract.rentValueCents)}
                </span>
              </p>
              <p>
                Data:{" "}
                <span className="text-white">
                  {new Date(contract.signedAtDate).toLocaleDateString("pt-BR")}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* texto */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-black/50 p-6">
          <div className="text-white font-bold mb-3">Texto do contrato</div>
          <pre className="whitespace-pre-wrap text-white/80 text-sm leading-relaxed">
            {contract.contractText}
          </pre>
        </div>

        {/* assinaturas */}
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-lg font-extrabold">✍️ Locador (você)</h3>

            <p className="mt-2 text-sm text-white/60">
              Status:{" "}
              {contract.ownerSignedAt ? (
                <span className="text-green-300 font-semibold">ASSINADO</span>
              ) : (
                <span className="text-yellow-300 font-semibold">PENDENTE</span>
              )}
            </p>

            {contract.ownerSignatureDataUrl ? (
              <img
                src={contract.ownerSignatureDataUrl}
                alt="Assinatura do locador"
                className="mt-4 rounded-xl border border-white/10 bg-black/30 p-3 max-h-40"
              />
            ) : (
              <div className="mt-4 rounded-xl border border-white/10 bg-black/30 p-4 text-white/50 text-sm">
                Nenhuma assinatura do locador ainda.
              </div>
            )}

            {!contract.ownerSignedAt ? (
              <>
                <div className="mt-4">
                  <label className="text-sm text-white/70 font-semibold">
                    Teste rápido: cole um signatureDataUrl
                  </label>
                  <textarea
                    value={signatureDataUrl}
                    onChange={(e) => setSignatureDataUrl(e.target.value)}
                    placeholder='Ex: data:image/png;base64,iVBORw0...'
                    className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none"
                    rows={4}
                  />
                </div>

                <button
                  onClick={signOwner}
                  className="mt-4 w-full rounded-xl bg-gradient-to-r from-fuchsia-500 to-purple-600 px-4 py-3 font-semibold hover:opacity-95"
                >
                  ✅ Assinar como locador
                </button>
              </>
            ) : null}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-lg font-extrabold">✍️ Inquilino</h3>

            <p className="mt-2 text-sm text-white/60">
              Status:{" "}
              {contract.tenantSignedAt ? (
                <span className="text-green-300 font-semibold">ASSINADO</span>
              ) : (
                <span className="text-yellow-300 font-semibold">PENDENTE</span>
              )}
            </p>

            {contract.tenantSignatureDataUrl ? (
              <img
                src={contract.tenantSignatureDataUrl}
                alt="Assinatura do inquilino"
                className="mt-4 rounded-xl border border-white/10 bg-black/30 p-3 max-h-40"
              />
            ) : (
              <div className="mt-4 rounded-xl border border-white/10 bg-black/30 p-4 text-white/50 text-sm">
                Nenhuma assinatura do inquilino ainda.
              </div>
            )}

            <div className="mt-4 rounded-xl border border-white/10 bg-black/30 p-4 text-white/60 text-sm">
              O inquilino assina pelo painel dele em:{" "}
              <span className="text-white font-semibold">/tenant/contract</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

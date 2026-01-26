"use client";

import { useEffect, useState } from "react";

type Contract = {
  id: string;
  status: string;
  contractText: string;
  ownerSignedAt: string | null;
  tenantSignedAt: string | null;
  tenantProfile?: {
    fullName: string;
    city: string;
  };
};

export default function OwnerContractViewPage({
  params,
}: {
  params: { id: string };
}) {
  const [loading, setLoading] = useState(true);
  const [contract, setContract] = useState<Contract | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [signing, setSigning] = useState(false);

  async function loadContract() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/owner/contracts/${params.id}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "Erro ao carregar contrato");
        return;
      }

      setContract(data.contract);
    } catch {
      setError("Erro interno ao carregar contrato");
    } finally {
      setLoading(false);
    }
  }

  async function signOwner() {
    setSigning(true);
    setError(null);

    try {
      // ✅ assinatura fake (só pra funcionar)
      const signatureDataUrl = "data:image/png;base64,ASSINATURA_OWNER";

      const res = await fetch(`/api/contracts/${params.id}/owner-sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signatureDataUrl }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "Erro ao assinar");
        return;
      }

      await loadContract();
    } catch {
      setError("Erro interno ao assinar");
    } finally {
      setSigning(false);
    }
  }

  useEffect(() => {
    loadContract();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Carregando contrato...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <div className="max-w-xl w-full rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-red-200">
          {error}
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Contrato não encontrado.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 py-10">
      <div className="mx-auto w-full max-w-4xl">
        <h1 className="text-2xl font-extrabold">📄 Ver Contrato (Owner)</h1>

        <p className="text-white/60 text-sm mt-1">
          Contrato ID: <span className="text-white">{contract.id}</span>
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href={`/api/contracts/${contract.id}/pdf`}
            target="_blank"
            className="rounded-xl bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-purple-600 px-4 py-2 font-semibold hover:opacity-95"
          >
            ⬇️ Baixar PDF
          </a>

          <button
            disabled={signing}
            onClick={signOwner}
            className="rounded-xl bg-white/10 border border-white/10 px-4 py-2 font-semibold hover:bg-white/15 disabled:opacity-50"
          >
            ✍️ Assinar (Owner)
          </button>

          <button
            onClick={loadContract}
            className="rounded-xl bg-white/10 border border-white/10 px-4 py-2 font-semibold hover:bg-white/15"
          >
            🔄 Atualizar
          </button>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 whitespace-pre-wrap text-white/80">
          {contract.contractText}
        </div>

        <div className="mt-6 text-white/60 text-sm">
          <p>
            Status: <b className="text-white">{contract.status}</b>
          </p>

          <p className="mt-2">
            Owner assinou?{" "}
            <b className="text-white">
              {contract.ownerSignedAt ? "SIM ✅" : "NÃO ❌"}
            </b>
          </p>

          <p className="mt-1">
            Tenant assinou?{" "}
            <b className="text-white">
              {contract.tenantSignedAt ? "SIM ✅" : "NÃO ❌"}
            </b>
          </p>
        </div>
      </div>
    </div>
  );
}

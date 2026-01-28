"use client";

import { useEffect, useState } from "react";

type Contract = {
  id: string;
  status: string;
  contractText: string;
};

export default function OwnerContractView({
  params,
}: {
  params: { id: string };
}) {
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch(`/api/owner/contracts/${params.id}`);
    const data = await res.json();
    setContract(data.contract);
    setLoading(false);
  }

  async function sign() {
    const res = await fetch(
      `/api/owner/contracts/${params.id}/sign`,
      { method: "POST" }
    );

    if (res.ok) {
      alert("Contrato assinado!");
      load();
    } else {
      alert("Erro ao assinar");
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return <div className="p-10 text-white">Carregando…</div>;
  }

  if (!contract) {
    return <div className="p-10 text-white">Contrato não encontrado</div>;
  }

  return (
    <main className="min-h-screen bg-black text-white px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-extrabold mb-4">
          📄 Contrato
        </h1>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 whitespace-pre-wrap text-sm">
          {contract.contractText}
        </div>

        <div className="mt-6 flex gap-3">
          {contract.status !== "ACTIVE" && (
            <button
              onClick={sign}
              className="rounded-xl bg-green-600 px-4 py-3 font-semibold"
            >
              ✍️ Assinar
            </button>
          )}

          <a
            href={`/api/contracts/${contract.id}/pdf`}
            target="_blank"
            className="rounded-xl bg-white/10 px-4 py-3 hover:bg-white/20"
          >
            ⬇️ Baixar PDF
          </a>
        </div>
      </div>
    </main>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Contract = {
  id: string;
  status: string;
  createdAt: string;
  tenantProfile: {
    fullName: string;
    cpf: string;
  };
};

export default function OwnerContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/owner/contracts/list")
      .then((res) => res.json())
      .then((data) => {
        setContracts(data.contracts || []);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="p-10 text-white">Carregando contratos…</div>;
  }

  return (
    <main className="min-h-screen bg-black text-white px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-extrabold">📑 Contratos</h1>

        {contracts.length === 0 ? (
          <div className="mt-6 text-white/60">
            Nenhum contrato encontrado.
          </div>
        ) : (
          <div className="mt-8 grid gap-4">
            {contracts.map((c) => (
              <div
                key={c.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-6"
              >
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <p className="text-lg font-bold">
                      {c.tenantProfile.fullName}
                    </p>
                    <p className="text-sm text-white/60">
                      CPF: {c.tenantProfile.cpf}
                    </p>
                    <p className="text-sm mt-1">
                      Status:{" "}
                      <b>
                        {c.status === "ACTIVE"
                          ? "Ativo"
                          : c.status === "PENDING_SIGNATURES"
                          ? "Pendente"
                          : c.status}
                      </b>
                    </p>
                  </div>

                  <Link
                    href={`/owner/contracts/${c.id}`}
                    className="rounded-xl bg-white/10 px-4 py-2 hover:bg-white/20"
                  >
                    📄 Ver contrato
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

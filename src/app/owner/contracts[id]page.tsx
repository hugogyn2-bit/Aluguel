"use client";

import { useEffect, useState } from "react";
import SignaturePad from "@/components/SignaturePad";

export default function OwnerSignContractPage({ params }: { params: { id: string } }) {
  const contractId = params.id;

  const [loading, setLoading] = useState(true);
  const [contractText, setContractText] = useState("");
  const [status, setStatus] = useState("");
  const [signature, setSignature] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  async function load() {
    setLoading(true);
    setMsg("");

    const res = await fetch(`/api/contracts/${contractId}`);
    const data = await res.json();

    if (!res.ok) {
      setMsg(data?.error || "Erro ao carregar contrato");
      setLoading(false);
      return;
    }

    setContractText(data.contract.contractText);
    setStatus(data.contract.status);
    setSignature(data.contract.ownerSignatureDataUrl || null);

    setLoading(false);
  }

  async function sign() {
    setMsg("");

    if (!signature) {
      setMsg("Assine no campo acima para continuar.");
      return;
    }

    const res = await fetch(`/api/contracts/${contractId}/owner-sign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ signatureDataUrl: signature }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMsg(data?.error || "Erro ao assinar");
      return;
    }

    setMsg("Contrato assinado pelo LOCADOR ✅");
    await load();
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-white">Carregando...</div>;

  return (
    <div className="min-h-screen px-6 py-12 text-white">
      <div className="mx-auto max-w-4xl rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
        <h1 className="text-2xl font-extrabold">Assinar Contrato (LOCADOR)</h1>

        <p className="mt-2 text-white/60 text-sm">Status: <b>{status}</b></p>

        <pre className="mt-6 whitespace-pre-wrap rounded-xl bg-black/30 border border-white/10 p-4 text-sm">
          {contractText}
        </pre>

        <div className="mt-6">
          <p className="text-sm text-white/70 mb-2">Assinatura do LOCADOR:</p>
          <SignaturePad value={signature} onChange={setSignature} />
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={sign}
            className="rounded-xl px-4 py-3 bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-purple-600 font-semibold hover:opacity-95"
          >
            Assinar como LOCADOR
          </button>
        </div>

        {msg ? (
          <div className="mt-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
            {msg}
          </div>
        ) : null}
      </div>
    </div>
  );
}

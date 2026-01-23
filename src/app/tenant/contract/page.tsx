"use client";

import { useEffect, useState } from "react";
import SignaturePad from "@/components/SignaturePad";

type Contract = {
  id: string;
  status: string;

  contractText: string;

  signedCity: string | null;
  signedAtDate: string | null;

  rentValueCents: number;

  ownerSignatureDataUrl: string | null;
  tenantSignatureDataUrl: string | null;

  ownerSignedAt: string | null;
  tenantSignedAt: string | null;
};

export default function TenantContractPage() {
  const [loading, setLoading] = useState(true);
  const [contract, setContract] = useState<Contract | null>(null);

  const [sigDataUrl, setSigDataUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const [msg, setMsg] = useState<string>("");

  async function loadContract() {
    setLoading(true);
    setMsg("");

    try {
      const res = await fetch(`/api/tenant/contract`);
      const data = await res.json();

      if (!res.ok) {
        setMsg(data?.error || "Erro ao buscar contrato.");
        setContract(null);
        return;
      }

      setContract(data.contract);
    } catch {
      setMsg("Erro interno ao carregar contrato.");
      setContract(null);
    } finally {
      setLoading(false);
    }
  }

  async function saveTenantSignature() {
    if (!sigDataUrl) {
      setMsg("Desenhe sua assinatura antes de salvar.");
      return;
    }

    setSaving(true);
    setMsg("");

    try {
      const res = await fetch(`/api/tenant/contract/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signatureDataUrl: sigDataUrl }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMsg(data?.error || "Erro ao assinar contrato.");
        return;
      }

      setMsg("✅ Sua assinatura foi registrada!");
      await loadContract();
    } catch {
      setMsg("Erro interno ao salvar assinatura.");
    } finally {
      setSaving(false);
    }
  }

  async function downloadPdf() {
    setDownloading(true);
    setMsg("");

    try {
      // abre download direto
      window.open("/api/tenant/contract/pdf", "_blank");
    } finally {
      setDownloading(false);
    }
  }

  useEffect(() => {
    loadContract();
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        Carregando contrato...
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-xl font-bold">Meu Contrato</h1>
        <p className="text-white/70 mt-2">{msg || "Contrato não encontrado."}</p>
      </div>
    );
  }

  const rentBR = (contract.rentValueCents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-2xl font-extrabold">📄 Meu Contrato</h1>

        <span className="text-xs px-3 py-1 rounded-full border border-white/10 bg-white/10">
          Status: <b>{contract.status}</b>
        </span>
      </div>

      <div className="mt-3 text-sm text-white/70">
        Valor do aluguel: <span className="text-white font-semibold">{rentBR}</span>
      </div>

      {msg ? (
        <div className="mt-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
          {msg}
        </div>
      ) : null}

      {/* ✅ Botão baixar PDF */}
      <div className="mt-5">
        <button
          onClick={downloadPdf}
          disabled={downloading}
          className="w-full rounded-xl bg-white/10 border border-white/10 px-4 py-3 font-semibold hover:bg-white/15 disabled:opacity-60"
        >
          {downloading ? "Gerando PDF..." : "⬇️ Baixar contrato em PDF"}
        </button>
      </div>

      {/* CONTRATO */}
      <div className="mt-6">
        <h2 className="text-lg font-bold mb-2">Texto do contrato</h2>

        <pre className="whitespace-pre-wrap rounded-xl border border-white/10 bg-black/40 p-4 text-sm text-white/80 leading-relaxed">
          {contract.contractText}
        </pre>
      </div>

      {/* ASSINATURA LOCADOR */}
      <div className="mt-8">
        <h2 className="text-lg font-bold mb-2">Assinatura do LOCADOR</h2>

        {contract.ownerSignatureDataUrl ? (
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-white/70 mb-3">
              ✅ O proprietário já assinou este contrato.
            </p>

            <img
              src={contract.ownerSignatureDataUrl}
              alt="Assinatura do locador"
              className="bg-white rounded-lg p-2 max-w-full"
            />
          </div>
        ) : (
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-white/70">⏳ O proprietário ainda não assinou.</p>
          </div>
        )}
      </div>

      {/* ASSINATURA LOCATÁRIO */}
      <div className="mt-8">
        <h2 className="text-lg font-bold mb-2">Minha assinatura (LOCATÁRIO)</h2>

        {contract.tenantSignatureDataUrl ? (
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-white/70 mb-3">
              ✅ Você já assinou este contrato.
            </p>

            <img
              src={contract.tenantSignatureDataUrl}
              alt="Assinatura do locatário"
              className="bg-white rounded-lg p-2 max-w-full"
            />
          </div>
        ) : (
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-white/70 mb-3">
              Desenhe sua assinatura abaixo:
            </p>

            <SignaturePad onChange={setSigDataUrl} />

            <button
              onClick={saveTenantSignature}
              disabled={saving}
              className="mt-4 w-full rounded-xl bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-purple-600 px-4 py-3 font-semibold hover:opacity-95 disabled:opacity-60"
            >
              {saving ? "Salvando assinatura..." : "✅ Assinar como LOCATÁRIO"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

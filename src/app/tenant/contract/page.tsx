"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type ContractData = {
  id: string;
  tenantName: string;
  tenantEmail: string;
  tenantCpf: string;
  tenantRg: string;
  tenantBirthDate: string;
  tenantAddress: string;
  tenantCep: string;
  tenantCity: string;
  tenantPhone: string;
  rentValueCents: number;

  ownerName: string;
  ownerEmail: string;

  ownerSignedAt: string | null;
  tenantSignedAt: string | null;
};

export default function TenantContractPage() {
  const [loading, setLoading] = useState(true);
  const [contract, setContract] = useState<ContractData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [signing, setSigning] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);

  const rentFormatted = useMemo(() => {
    if (!contract) return "";
    return (contract.rentValueCents / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }, [contract]);

  function formatBRDate(dateISO: string) {
    const d = new Date(dateISO);
    return d.toLocaleDateString("pt-BR");
  }

  function clearCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  function getSignatureDataUrl() {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.toDataURL("image/png");
  }

  function startDraw(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    drawingRef.current = true;
    canvas.setPointerCapture(e.pointerId);

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function draw(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "white";
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  function endDraw() {
    drawingRef.current = false;
  }

  async function loadMyContract() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/tenant/contract`);
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

  async function tenantSign() {
    setSigning(true);
    setMessage(null);

    try {
      const signature = getSignatureDataUrl();
      if (!signature) {
        setMessage("Assine antes de enviar.");
        return;
      }

      const res = await fetch(`/api/tenant/contract/tenant-sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signature }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data?.error || "Erro ao assinar");
        return;
      }

      setMessage("✅ Assinatura do inquilino registrada!");
      clearCanvas();
      await loadMyContract();
    } catch {
      setMessage("Erro interno ao assinar");
    } finally {
      setSigning(false);
    }
  }

  useEffect(() => {
    loadMyContract();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Carregando contrato...
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <div className="max-w-lg w-full border border-white/10 bg-white/5 rounded-2xl p-6">
          <h1 className="text-xl font-bold">Erro</h1>
          <p className="mt-2 text-white/70">{error || "Contrato não encontrado"}</p>
        </div>
      </div>
    );
  }

  const tenantAlreadySigned = !!contract.tenantSignedAt;

  return (
    <div className="min-h-screen bg-black text-white px-4 py-10">
      <div className="mx-auto max-w-4xl border border-white/10 bg-white/5 rounded-2xl p-6 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold">📄 Contrato de Locação</h1>
            <p className="text-white/60 text-sm">
              Seu contrato ID: <span className="text-white">{contract.id}</span>
            </p>
          </div>

          <button
            onClick={() => window.open(`/api/contracts/${contract.id}/pdf`, "_blank")}
            className="rounded-xl px-4 py-3 bg-white/10 border border-white/10 hover:bg-white/15"
          >
            📄 Baixar contrato PDF
          </button>
        </div>

        <div className="mt-6 border border-white/10 rounded-2xl bg-black/30 p-5 text-sm leading-6 text-white/85">
          <p>
            <b>Locador:</b> {contract.ownerName} ({contract.ownerEmail})
          </p>
          <p className="mt-2">
            <b>Locatário:</b> {contract.tenantName} ({contract.tenantEmail})
          </p>

          <div className="mt-4 grid md:grid-cols-2 gap-3">
            <p>
              <b>CPF:</b> {contract.tenantCpf}
            </p>
            <p>
              <b>RG:</b> {contract.tenantRg}
            </p>
            <p>
              <b>Nascimento:</b> {formatBRDate(contract.tenantBirthDate)}
            </p>
            <p>
              <b>Telefone:</b> {contract.tenantPhone}
            </p>
          </div>

          <div className="mt-4">
            <p>
              <b>Endereço:</b> {contract.tenantAddress}
            </p>
            <p>
              <b>CEP:</b> {contract.tenantCep} — <b>Cidade:</b> {contract.tenantCity}
            </p>
          </div>

          <div className="mt-4">
            <p>
              <b>Valor do aluguel:</b> {rentFormatted}
            </p>
          </div>

          <div className="mt-6 text-white/60">
            <p>
              ✅ Assinatura do locador:{" "}
              {contract.ownerSignedAt ? (
                <span className="text-green-300 font-semibold">
                  OK ({new Date(contract.ownerSignedAt).toLocaleString("pt-BR")})
                </span>
              ) : (
                <span className="text-red-300 font-semibold">Pendente</span>
              )}
            </p>

            <p className="mt-1">
              ✅ Sua assinatura:{" "}
              {contract.tenantSignedAt ? (
                <span className="text-green-300 font-semibold">
                  OK ({new Date(contract.tenantSignedAt).toLocaleString("pt-BR")})
                </span>
              ) : (
                <span className="text-red-300 font-semibold">Pendente</span>
              )}
            </p>
          </div>
        </div>

        {/* ✅ Assinatura inquilino */}
        <div className="mt-6 border border-white/10 rounded-2xl bg-white/5 p-5">
          <h2 className="text-lg font-bold">✍️ Assinatura do Inquilino</h2>
          <p className="text-white/60 text-sm mt-1">
            Apenas o <b>inquilino</b> pode assinar aqui.
          </p>

          {tenantAlreadySigned ? (
            <div className="mt-4 rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-sm">
              ✅ Você já assinou este contrato.
            </div>
          ) : (
            <>
              <div className="mt-4">
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={180}
                  onPointerDown={startDraw}
                  onPointerMove={draw}
                  onPointerUp={endDraw}
                  onPointerLeave={endDraw}
                  className="w-full rounded-xl border border-white/10 bg-black"
                />
              </div>

              <div className="mt-3 flex flex-col md:flex-row gap-3">
                <button
                  onClick={clearCanvas}
                  className="rounded-xl px-4 py-3 bg-white/10 border border-white/10 hover:bg-white/15"
                >
                  🧹 Limpar
                </button>

                <button
                  onClick={tenantSign}
                  disabled={signing}
                  className="rounded-xl px-4 py-3 bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-purple-600 font-semibold hover:opacity-95 disabled:opacity-60"
                >
                  {signing ? "Assinando..." : "✅ Assinar como Inquilino"}
                </button>
              </div>
            </>
          )}

          {message ? (
            <div className="mt-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
              {message}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

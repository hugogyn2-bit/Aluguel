"use client";

import { useState } from "react";

export function PayButton({ label = "Assinar Premium" }: { label?: string }) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onClick() {
    try {
      setLoading(true);
      setErr(null);

      const res = await fetch("/api/pay/owner/start", { method: "POST" });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErr(data?.error || `Erro (${res.status}) ao iniciar pagamento.`);
        return;
      }

      const url = data?.url;
      if (!url) {
        setErr("Resposta sem URL de checkout.");
        return;
      }

      window.location.assign(url);
    } catch (e: any) {
      setErr(e?.message || "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        style={{ padding: 12, borderRadius: 10, cursor: loading ? "not-allowed" : "pointer" }}
      >
        {loading ? "Abrindo checkout..." : label}
      </button>

      {err ? <p style={{ color: "crimson", fontSize: 14 }}>{err}</p> : null}
    </div>
  );
}

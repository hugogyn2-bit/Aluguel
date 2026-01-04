"use client";

import { useState } from "react";

export function PayButton({
  label = "Assinar Premium",
  className,
}: {
  label?: string;
  className?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onClick() {
    try {
      setLoading(true);
      setErr(null);

      // 1) tenta via POST (retorna JSON com URL)
      const res = await fetch("/api/pay/owner/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });

      // lê como texto para debug (caso não seja JSON)
      const text = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch {
        data = { raw: text };
      }

      if (!res.ok) {
        setErr(`HTTP ${res.status}: ${data?.error || data?.raw || "Erro ao iniciar pagamento."}`);
        return;
      }

      const url = data?.url;
      if (!url || typeof url !== "string") {
        setErr("API respondeu sem URL válida de checkout.");
        return;
      }

      // 2) redireciona o usuário
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
        className={className}
        style={{
          padding: 12,
          borderRadius: 10,
          border: "1px solid rgba(0,0,0,0.2)",
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? "Abrindo checkout..." : label}
      </button>

      {err ? (
        <p style={{ color: "crimson", fontSize: 14, margin: 0 }}>
          {err}
        </p>
      ) : null}
    </div>
  );
}

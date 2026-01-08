"use client";

import { useState } from "react";

export default function Page() {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function start() {
    setLoading(true);
    setErr(null);
    const res = await fetch("/api/pay/owner/start", { method: "POST" });
    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) return setErr(data?.error || "Erro ao iniciar pagamento.");
    if (!data?.url) return setErr("Resposta sem URL.");
    window.location.href = data.url;
  }

  return (
    <main style={{ maxWidth: 600, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 24, fontWeight: 800 }}>Plano necessário</h1>
      <p style={{ opacity: 0.7, marginTop: 8 }}>
        Seu trial terminou. Para continuar usando o modo proprietário, assine o plano.
      </p>

      <button onClick={start} disabled={loading} style={{ marginTop: 16 }}>
        {loading ? "Abrindo..." : "Assinar agora"}
      </button>

      {err ? <p style={{ color: "crimson", marginTop: 10 }}>{err}</p> : null}
    </main>
  );
}

"use client";

import { useState } from "react";

import { Button } from "@/components/Button";

export function TrialButton() {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onClick() {
    try {
      setLoading(true);
      setErr(null);

      const res = await fetch("/api/owner/trial/start", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(data?.error || `Erro (${res.status}) ao iniciar teste.`);
        return;
      }

      // O JWT do NextAuth só atualiza no próximo login.
      // Faz logout e volta para entrar de novo (já com o trial liberado).
      window.location.href = "/api/auth/signout?callbackUrl=/auth/sign-in?role=OWNER";
    } catch (e: any) {
      setErr(e?.message || "Erro inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-2">
      <Button variant="outline" loading={loading} onClick={onClick}>
        Usar teste grátis (3 dias)
      </Button>
      {err ? <p className="text-xs text-red-400">{err}</p> : null}
      <p className="text-xs text-muted">
        Após ativar, você será desconectado e precisará entrar novamente para liberar o acesso.
      </p>
    </div>
  );
}

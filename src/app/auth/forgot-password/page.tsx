"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, birthDate }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Erro ao verificar dados.");
      return;
    }

    setMessage("Dados confirmados. Continue para redefinir sua senha.");
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-5">
      <div className="w-full max-w-md space-y-6">
        <h1 className="text-3xl font-black tracking-tight">Esqueci minha senha</h1>

        {error && <p className="text-sm text-red-500">{error}</p>}
        {message && <p className="text-sm text-green-600">{message}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full rounded-xl border px-4 py-3"
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            className="w-full rounded-xl border px-4 py-3"
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            required
          />

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Verificando..." : "Continuar"}
          </Button>
        </form>

        <div className="text-center">
          <Link href="/auth/sign-in" className="text-sm underline">
            Voltar para login
          </Link>
        </div>
      </div>
    </main>
  );
}

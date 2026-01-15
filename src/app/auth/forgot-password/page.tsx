"use client";

import Link from "next/link";
import { useState } from "react";
import AuthCard from "@/components/auth/AuthCard";
import AuthInput from "@/components/auth/AuthInput";
import AuthButton from "@/components/auth/AuthButton";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  async function handleForgot(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email") || "");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setLoading(false);
        setErrorMsg(data?.message || "Não foi possível enviar o link.");
        return;
      }

      setLoading(false);
      setSuccessMsg("Se o email existir, enviamos o link ✅");
    } catch {
      setLoading(false);
      setErrorMsg("Erro inesperado. Tente novamente.");
    }
  }

  return (
    <AuthCard
      title="Esqueci minha senha"
      subtitle="Digite seu email para receber o link ✨"
      badgeTitle="Recuperação"
      badgeSubtitle="Reset de senha"
      footer={
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/60">Lembrou?</span>
          <Link
            href="/auth/sign-in"
            className="font-semibold text-cyan-300 hover:text-cyan-200"
          >
            Voltar pro login →
          </Link>
        </div>
      }
    >
      <form onSubmit={handleForgot} className="space-y-4">
        <AuthInput
          label="Email"
          name="email"
          type="email"
          required
          placeholder="seu@email.com"
        />

        {errorMsg ? (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {errorMsg}
          </div>
        ) : null}

        {successMsg ? (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            {successMsg}
          </div>
        ) : null}

        <AuthButton loading={loading} loadingText="Enviando...">
          Enviar link
        </AuthButton>
      </form>
    </AuthCard>
  );
}

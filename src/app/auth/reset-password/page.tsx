"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import AuthCard from "@/components/auth/AuthCard";
import AuthInput from "@/components/auth/AuthInput";
import AuthButton from "@/components/auth/AuthButton";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  async function handleReset(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const password = String(formData.get("password") || "");
    const confirmPassword = String(formData.get("confirmPassword") || "");

    if (!token) {
      setLoading(false);
      setErrorMsg("Token inválido ou ausente. Solicite novamente.");
      return;
    }

    if (password.length < 6) {
      setLoading(false);
      setErrorMsg("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setLoading(false);
      setErrorMsg("As senhas não conferem.");
      return;
    }

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setLoading(false);
        setErrorMsg(data?.message || "Não foi possível redefinir a senha.");
        return;
      }

      setLoading(false);
      setSuccessMsg("Senha atualizada! Indo pro login ✅");

      setTimeout(() => {
        router.push("/auth/sign-in");
      }, 1000);
    } catch {
      setLoading(false);
      setErrorMsg("Erro inesperado. Tente novamente.");
    }
  }

  return (
    <AuthCard
      title="Redefinir senha"
      subtitle="Digite sua nova senha com segurança ✨"
      badgeTitle="Nova senha"
      badgeSubtitle="Atualização"
      footer={
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/60">Voltar?</span>
          <Link
            href="/auth/sign-in"
            className="font-semibold text-cyan-300 hover:text-cyan-200"
          >
            Login →
          </Link>
        </div>
      }
    >
      {!token ? (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          Token inválido ou ausente.
        </div>
      ) : null}

      <form onSubmit={handleReset} className="space-y-4">
        <AuthInput
          label="Nova senha"
          name="password"
          type="password"
          required
          placeholder="••••••••"
        />

        <AuthInput
          label="Confirmar senha"
          name="confirmPassword"
          type="password"
          required
          placeholder="••••••••"
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

        <AuthButton
          loading={loading}
          loadingText="Salvando..."
          disabled={!token}
        >
          Salvar senha
        </AuthButton>
      </form>
    </AuthCard>
  );
}

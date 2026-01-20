"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useState } from "react";

import AuthCard from "@/components/auth/AuthCard";
import AuthInput from "@/components/auth/AuthInput";
import AuthButton from "@/components/auth/AuthButton";
import AuthToggle from "@/components/auth/AuthToggle";

export default function SignInPage() {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [remember, setRemember] = useState(true);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,

      // ✅ AQUI você troca pra onde vai depois do login
      callbackUrl: "/",
    });

    setLoading(false);

    if (res?.error) {
      setErrorMsg("Email ou senha inválidos.");
      return;
    }

    window.location.href = "/";
  }

  return (
    <AuthCard
      title="Entrar"
      subtitle="Faça login para continuar ✨"
      badgeTitle="Bem-vindo"
      badgeSubtitle="Acesso seguro"
      footer={
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/60">Não tem conta?</span>
          <Link
            href="/auth/sign-up"
            className="font-semibold text-cyan-300 hover:text-cyan-200"
          >
            Criar conta →
          </Link>
        </div>
      }
    >
      <form onSubmit={handleLogin} className="space-y-4">
        <AuthInput
          label="Email"
          name="email"
          type="email"
          required
          placeholder="seu@email.com"
        />

        <AuthInput
          label="Senha"
          name="password"
          type="password"
          required
          placeholder="••••••••"
        />

        <div className="flex items-center justify-between gap-3">
          <AuthToggle checked={remember} onChange={setRemember} label="Lembrar de mim" />

          <Link
            href="/auth/forgot-password"
            className="text-sm font-semibold text-cyan-300 hover:text-cyan-200"
          >
            Esqueci minha senha →
          </Link>
        </div>

        {errorMsg ? (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {errorMsg}
          </div>
        ) : null}

        <AuthButton loading={loading} loadingText="Entrando...">
          Entrar
        </AuthButton>
      </form>
    </AuthCard>
  );
}

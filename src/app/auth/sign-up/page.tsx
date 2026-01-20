"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import AuthCard from "@/components/auth/AuthCard";
import AuthInput from "@/components/auth/AuthInput";
import AuthButton from "@/components/auth/AuthButton";
import NeonLogo from "@/components/auth/NeonLogo";

export default function SignUpPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      const res = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, birthDate }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMsg(data?.error || "Erro ao criar conta.");
        setLoading(false);
        return;
      }

      setMsg("✅ Conta criada! Indo para o login...");
      setTimeout(() => router.push("/auth/sign-in"), 1200);
    } catch {
      setMsg("Erro interno. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard>
      <div className="flex flex-col items-center gap-3 mb-6">
        <NeonLogo />
        <h1 className="text-2xl font-bold text-white">Criar Conta</h1>
        <p className="text-sm text-white/60 text-center">
          Cadastre-se como <span className="text-cyan-300">OWNER</span> para gerenciar seus imóveis.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthInput
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seuemail@gmail.com"
          required
        />

        <AuthInput
          label="Senha (mínimo 6 caracteres)"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="********"
          required
        />

        {/* ✅ ESSENCIAL (Sua API exige isso) */}
        <AuthInput
          label="Data de nascimento (segurança)"
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          required
        />

        {msg && (
          <div className="text-sm text-white/80 bg-white/5 border border-white/10 rounded-xl p-3">
            {msg}
          </div>
        )}

        <AuthButton type="submit" disabled={loading}>
          {loading ? "Criando..." : "Criar conta"}
        </AuthButton>
      </form>

      <div className="mt-6 text-center">
        <Link className="text-sm text-cyan-300 hover:underline" href="/auth/sign-in">
          Já tenho conta → Login
        </Link>
      </div>
    </AuthCard>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";

type ApiError = {
  error?: string;
  details?: Record<string, string[]>;
};

export default function CreateTenantPage() {
  const [loading, setLoading] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [cep, setCep] = useState("");
  const [cpf, setCpf] = useState("");
  const [rg, setRg] = useState("");
  const [birthDate, setBirthDate] = useState("");

  const [msg, setMsg] = useState<string | null>(null);
  const [createdLogin, setCreatedLogin] = useState<{ email: string; password: string } | null>(
    null
  );

  function formatOnlyNumbers(v: string) {
    return v.replace(/\D/g, "");
  }

  async function handleCreateTenant(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setMsg(null);
    setCreatedLogin(null);

    try {
      const res = await fetch("/api/owner/tenants/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          address,
          cep,
          cpf,
          rg,
          birthDate,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const err = data as ApiError;

        if (err?.details) {
          const readable = Object.entries(err.details)
            .map(([field, errors]) => `• ${field}: ${errors.join(", ")}`)
            .join("\n");

          setMsg(err.error ? `${err.error}\n${readable}` : readable);
        } else {
          setMsg(err?.error || "Erro ao cadastrar inquilino");
        }

        return;
      }

      setMsg(data?.message || "✅ Inquilino cadastrado com sucesso!");
      setCreatedLogin(data?.login || null);

      // limpa
      setFullName("");
      setEmail("");
      setAddress("");
      setCep("");
      setCpf("");
      setRg("");
      setBirthDate("");
    } catch (err) {
      setMsg("❌ Erro interno ao cadastrar inquilino");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 py-10">
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold">Cadastrar novo inquilino</h1>

          <Link
            href="/owner"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
          >
            ⬅ Voltar
          </Link>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <form onSubmit={handleCreateTenant} className="space-y-4">
            {/* Nome */}
            <div>
              <label className="text-sm text-white/70">Nome completo</label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ex: João da Silva"
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 outline-none focus:border-white/30"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-sm text-white/70">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ex: joao@email.com"
                type="email"
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 outline-none focus:border-white/30"
                required
              />
            </div>

            {/* Endereço */}
            <div>
              <label className="text-sm text-white/70">Endereço</label>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Rua, número, bairro, cidade"
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 outline-none focus:border-white/30"
                required
              />
            </div>

            {/* CEP */}
            <div>
              <label className="text-sm text-white/70">CEP</label>
              <input
                value={cep}
                onChange={(e) => setCep(formatOnlyNumbers(e.target.value))}
                placeholder="Somente números"
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 outline-none focus:border-white/30"
                required
              />
            </div>

            {/* CPF */}
            <div>
              <label className="text-sm text-white/70">CPF</label>
              <input
                value={cpf}
                onChange={(e) => setCpf(formatOnlyNumbers(e.target.value))}
                placeholder="Somente números"
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 outline-none focus:border-white/30"
                required
              />
            </div>

            {/* RG */}
            <div>
              <label className="text-sm text-white/70">RG</label>
              <input
                value={rg}
                onChange={(e) => setRg(e.target.value)}
                placeholder="Ex: 1234567"
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 outline-none focus:border-white/30"
                required
              />
            </div>

            {/* Data de nascimento */}
            <div>
              <label className="text-sm text-white/70">Data de nascimento</label>
              <input
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                type="date"
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 outline-none focus:border-white/30"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-purple-600 px-4 py-3 font-semibold hover:opacity-95 disabled:opacity-60"
            >
              {loading ? "Cadastrando..." : "✅ Cadastrar inquilino"}
            </button>
          </form>

          {/* Mensagens */}
          {msg ? (
            <div className="mt-5 whitespace-pre-line rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
              {msg}
            </div>
          ) : null}

          {/* Login criado */}
          {createdLogin ? (
            <div className="mt-5 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm">
              <div className="font-semibold text-green-200">
                ✅ Login do inquilino criado automaticamente:
              </div>

              <div className="mt-2 text-white/90">
                <b>Email:</b> {createdLogin.email}
                <br />
                <b>Senha padrão:</b> {createdLogin.password}
              </div>

              <div className="mt-2 text-xs text-white/60">
                * O inquilino será obrigado a trocar a senha no primeiro login.
              </div>
            </div>
          ) : null}

          <div className="mt-6 text-xs text-white/40">
            Dica: você pode criar o tenant com senha padrão <b>123456</b> e ele troca no primeiro login.
          </div>
        </div>
      </div>
    </div>
  );
}

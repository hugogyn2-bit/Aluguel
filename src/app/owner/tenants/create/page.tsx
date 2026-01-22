"use client";

import { useState } from "react";

export default function CreateTenantPage() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [cep, setCep] = useState("");
  const [cpf, setCpf] = useState("");
  const [rg, setRg] = useState("");
  const [birthDate, setBirthDate] = useState("");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg("");

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
        setMsg(data?.error || "Erro ao cadastrar inquilino");
        return;
      }

      setMsg(
        `✅ Inquilino criado!\nEmail: ${data?.tenant?.email}\nSenha padrão: 123456`
      );

      setTimeout(() => {
        window.location.href = "/owner/tenants";
      }, 1200);
    } catch (err) {
      setMsg("Erro interno no cadastro.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 py-10">
      <div className="mx-auto max-w-2xl rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <h1 className="text-2xl font-extrabold">Cadastrar Inquilino</h1>
        <p className="mt-2 text-white/70">
          O inquilino será criado com senha automática <b>123456</b> e será
          obrigado a trocar no primeiro login.
        </p>

        <form onSubmit={handleCreate} className="mt-6 space-y-4">
          <div>
            <label className="text-sm text-white/70">Nome</label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 outline-none"
              placeholder="Nome completo"
              required
            />
          </div>

          <div>
            <label className="text-sm text-white/70">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 outline-none"
              placeholder="email@exemplo.com"
              type="email"
              required
            />
          </div>

          <div>
            <label className="text-sm text-white/70">Endereço</label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="mt-1 w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 outline-none"
              placeholder="Rua, número, bairro, cidade"
              required
            />
          </div>

          <div>
            <label className="text-sm text-white/70">CEP</label>
            <input
              value={cep}
              onChange={(e) => setCep(e.target.value)}
              className="mt-1 w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 outline-none"
              placeholder="00000-000"
              required
            />
          </div>

          <div>
            <label className="text-sm text-white/70">CPF</label>
            <input
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
              className="mt-1 w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 outline-none"
              placeholder="000.000.000-00"
              required
            />
          </div>

          <div>
            <label className="text-sm text-white/70">RG</label>
            <input
              value={rg}
              onChange={(e) => setRg(e.target.value)}
              className="mt-1 w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 outline-none"
              placeholder="Digite o RG"
              required
            />
          </div>

          <div>
            <label className="text-sm text-white/70">Data de Nascimento</label>
            <input
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="mt-1 w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 outline-none"
              type="date"
              required
            />
          </div>

          <button
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-purple-600 px-4 py-3 font-semibold hover:opacity-95 disabled:opacity-60"
          >
            {loading ? "Salvando..." : "✅ Criar Inquilino"}
          </button>

          {msg ? (
            <div className="whitespace-pre-line rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
              {msg}
            </div>
          ) : null}
        </form>
      </div>
    </div>
  );
}

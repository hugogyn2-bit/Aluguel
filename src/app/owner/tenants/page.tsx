"use client";

import { useState } from "react";
import Link from "next/link";

export default function OwnerCreateTenantPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [address, setAddress] = useState("");
  const [cep, setCep] = useState("");

  const [cpf, setCpf] = useState("");
  const [rg, setRg] = useState("");

  const [birthDate, setBirthDate] = useState(""); // formato: YYYY-MM-DD

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function createTenant() {
    setLoading(true);
    setMsg("");

    try {
      const res = await fetch("/api/owner/tenants/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
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

      setMsg(data?.message || "✅ Inquilino cadastrado com sucesso!");

      // limpa os campos
      setName("");
      setEmail("");
      setAddress("");
      setCep("");
      setCpf("");
      setRg("");
      setBirthDate("");
    } catch (err) {
      setMsg("Erro interno ao cadastrar inquilino.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white px-6 py-12">
      <div className="mx-auto max-w-2xl rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
        <h1 className="text-3xl font-extrabold">➕ Cadastrar Inquilino</h1>
        <p className="text-white/60 mt-2">
          Preencha os dados abaixo para cadastrar um novo inquilino.
        </p>

        <div className="mt-8 space-y-4">
          {/* Nome */}
          <div>
            <label className="text-sm text-white/60">Nome</label>
            <input
              className="mt-1 w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 outline-none focus:border-white/30"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: João da Silva"
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-sm text-white/60">Email</label>
            <input
              className="mt-1 w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 outline-none focus:border-white/30"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ex: joao@email.com"
            />
          </div>

          {/* Endereço */}
          <div>
            <label className="text-sm text-white/60">Endereço</label>
            <input
              className="mt-1 w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 outline-none focus:border-white/30"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Ex: Rua X, Nº 123 - Centro"
            />
          </div>

          {/* CEP */}
          <div>
            <label className="text-sm text-white/60">CEP</label>
            <input
              className="mt-1 w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 outline-none focus:border-white/30"
              value={cep}
              onChange={(e) => setCep(e.target.value)}
              placeholder="Ex: 74000-000"
            />
          </div>

          {/* CPF */}
          <div>
            <label className="text-sm text-white/60">CPF</label>
            <input
              className="mt-1 w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 outline-none focus:border-white/30"
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
              placeholder="Ex: 123.456.789-00"
            />
          </div>

          {/* RG */}
          <div>
            <label className="text-sm text-white/60">RG</label>
            <input
              className="mt-1 w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 outline-none focus:border-white/30"
              value={rg}
              onChange={(e) => setRg(e.target.value)}
              placeholder="Ex: 1234567"
            />
          </div>

          {/* Data de Nascimento */}
          <div>
            <label className="text-sm text-white/60">Data de Nascimento</label>
            <input
              type="date"
              className="mt-1 w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 outline-none focus:border-white/30"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
            />
          </div>

          <button
            onClick={createTenant}
            disabled={loading || !name || !email}
            className="w-full rounded-xl bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-purple-600 px-4 py-3 font-semibold hover:opacity-95 disabled:opacity-60"
          >
            {loading ? "Cadastrando..." : "Cadastrar Inquilino"}
          </button>

          {msg ? (
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
              {msg}
            </div>
          ) : null}
        </div>

        <div className="mt-10 flex gap-3 flex-wrap">
          <Link
            href="/owner/tenants"
            className="rounded-xl px-4 py-3 bg-white/10 border border-white/10 hover:bg-white/15 transition"
          >
            ← Meus Inquilinos
          </Link>

          <Link
            href="/owner/dashboard"
            className="rounded-xl px-4 py-3 bg-white/10 border border-white/10 hover:bg-white/15 transition"
          >
            ← Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

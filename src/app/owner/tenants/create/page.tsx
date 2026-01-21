"use client";

import { useState } from "react";
import Link from "next/link";

export default function OwnerCreateTenantPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function createTenant() {
    setLoading(true);
    setMsg("");

    try {
      // ✅ Ajuste aqui se sua API for outra
      const res = await fetch("/api/owner/tenants/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMsg(data?.error || "Erro ao criar inquilino");
        return;
      }

      setMsg("✅ Inquilino criado com sucesso!");
      setName("");
      setEmail("");
    } catch {
      setMsg("Erro interno ao criar inquilino.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white px-6 py-12">
      <div className="mx-auto max-w-2xl rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
        <h1 className="text-3xl font-extrabold">➕ Novo Inquilino</h1>
        <p className="text-white/60 mt-2">
          Preencha os dados abaixo para cadastrar um inquilino.
        </p>

        <div className="mt-8 space-y-4">
          <div>
            <label className="text-sm text-white/60">Nome</label>
            <input
              className="mt-1 w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 outline-none focus:border-white/30"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: João da Silva"
            />
          </div>

          <div>
            <label className="text-sm text-white/60">Email</label>
            <input
              className="mt-1 w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 outline-none focus:border-white/30"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ex: joao@email.com"
            />
          </div>

          <button
            onClick={createTenant}
            disabled={loading || !name || !email}
            className="w-full rounded-xl bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-purple-600 px-4 py-3 font-semibold hover:opacity-95 disabled:opacity-60"
          >
            {loading ? "Criando..." : "Cadastrar Inquilino"}
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

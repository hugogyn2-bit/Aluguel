"use client";

import { useState } from "react";

function maskCPF(v: string) {
  return v
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function maskCEP(v: string) {
  return v
    .replace(/\D/g, "")
    .slice(0, 8)
    .replace(/(\d{5})(\d)/, "$1-$2");
}

function maskBirth(v: string) {
  return v
    .replace(/\D/g, "")
    .slice(0, 8)
    .replace(/(\d{2})(\d)/, "$1/$2")
    .replace(/(\d{2})(\d)/, "$1/$2");
}

function maskPhone(v: string) {
  // (99) 99999-9999 ou (99) 9999-9999
  const digits = v.replace(/\D/g, "").slice(0, 11);

  if (digits.length <= 10) {
    return digits
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }

  return digits
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}

export default function CreateTenantPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [cep, setCep] = useState("");
  const [cpf, setCpf] = useState("");
  const [rg, setRg] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [phone, setPhone] = useState(""); // ✅ NOVO

  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleCreateTenant() {
    setLoading(true);
    setMsg(null);

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
          phone, // ✅ NOVO
          birthDate, // (se quiser salvar depois no prisma, dá pra usar)
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMsg(data?.error || "Erro ao cadastrar inquilino.");
        return;
      }

      setMsg(`✅ Criado! Senha padrão: ${data?.defaultPassword || "123456"}`);
      setFullName("");
      setEmail("");
      setAddress("");
      setCep("");
      setCpf("");
      setRg("");
      setBirthDate("");
      setPhone("");
    } catch {
      setMsg("Erro interno ao cadastrar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 py-10">
      <div className="mx-auto w-full max-w-2xl rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <h1 className="text-2xl font-extrabold">Cadastrar Inquilino</h1>
        <p className="mt-2 text-white/70 text-sm">
          O inquilino será criado com senha padrão <b>123456</b> e será obrigado a trocar no primeiro login.
        </p>

        <div className="mt-6 grid gap-3">
          <input
            className="w-full rounded-xl bg-white/10 border border-white/10 px-4 py-3 outline-none"
            placeholder="Nome completo"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <input
            className="w-full rounded-xl bg-white/10 border border-white/10 px-4 py-3 outline-none"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="w-full rounded-xl bg-white/10 border border-white/10 px-4 py-3 outline-none"
            placeholder="Telefone (Ex.: (11) 99999-9999)"
            value={phone}
            onChange={(e) => setPhone(maskPhone(e.target.value))}
          />

          <input
            className="w-full rounded-xl bg-white/10 border border-white/10 px-4 py-3 outline-none"
            placeholder="Endereço completo"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />

          <input
            className="w-full rounded-xl bg-white/10 border border-white/10 px-4 py-3 outline-none"
            placeholder="CEP (Ex.: 00000-000)"
            value={cep}
            onChange={(e) => setCep(maskCEP(e.target.value))}
          />

          <div className="grid gap-3 md:grid-cols-2">
            <input
              className="w-full rounded-xl bg-white/10 border border-white/10 px-4 py-3 outline-none"
              placeholder="CPF (Ex.: 000.000.000-00)"
              value={cpf}
              onChange={(e) => setCpf(maskCPF(e.target.value))}
            />

            <input
              className="w-full rounded-xl bg-white/10 border border-white/10 px-4 py-3 outline-none"
              placeholder="RG"
              value={rg}
              onChange={(e) => setRg(e.target.value)}
            />
          </div>

          <input
            className="w-full rounded-xl bg-white/10 border border-white/10 px-4 py-3 outline-none"
            placeholder="Data de nascimento (Ex.: dd/mm/aaaa)"
            value={birthDate}
            onChange={(e) => setBirthDate(maskBirth(e.target.value))}
          />

          <button
            onClick={handleCreateTenant}
            disabled={loading}
            className="mt-2 w-full rounded-xl bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-purple-600 px-4 py-3 font-semibold hover:opacity-95 disabled:opacity-60"
          >
            {loading ? "Cadastrando..." : "✅ Criar Inquilino"}
          </button>

          {msg ? (
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
              {msg}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

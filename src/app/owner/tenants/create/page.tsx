"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OwnerCreateTenantPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [cpf, setCpf] = useState("");
  const [rg, setRg] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [cep, setCep] = useState("");
  const [city, setCity] = useState("");
  const [birthDate, setBirthDate] = useState(""); // yyyy-mm-dd
  const [rentValue, setRentValue] = useState(""); // em reais

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const rentValueCents = Math.round(Number(rentValue.replace(",", ".")) * 100);

      const res = await fetch("/api/owner/tenants/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          cpf,
          rg,
          email,
          phone,
          address,
          cep,
          city,
          birthDate,
          rentValueCents,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "Erro ao criar inquilino.");
        return;
      }

      // ✅ volta pra lista
      router.push("/owner/tenants");
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("Erro interno ao enviar formulário.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 py-10">
      <div className="mx-auto w-full max-w-3xl">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold">➕ Criar Inquilino</h1>
            <p className="text-white/60 text-sm mt-1">
              Preencha os dados do inquilino para criar a conta automaticamente.
            </p>
          </div>

          <a
            href="/owner/tenants"
            className="rounded-xl bg-white/10 border border-white/10 px-4 py-3 font-semibold hover:bg-white/15"
          >
            ⬅ Voltar
          </a>
        </div>

        {error ? (
          <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-red-200">
            {error}
          </div>
        ) : null}

        <form
          onSubmit={handleSubmit}
          className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Nome completo"
              value={fullName}
              onChange={setFullName}
              placeholder="Ex: João da Silva"
              required
            />

            <Input
              label="CPF"
              value={cpf}
              onChange={setCpf}
              placeholder="000.000.000-00"
              required
            />

            <Input
              label="RG"
              value={rg}
              onChange={setRg}
              placeholder="Ex: 1234567"
              required
            />

            <Input
              label="Email (login do inquilino)"
              value={email}
              onChange={setEmail}
              placeholder="email@email.com"
              type="email"
              required
            />

            <Input
              label="Telefone"
              value={phone}
              onChange={setPhone}
              placeholder="(00) 90000-0000"
              required
            />

            <Input
              label="Cidade"
              value={city}
              onChange={setCity}
              placeholder="Ex: Goiânia"
              required
            />

            <Input
              label="Endereço"
              value={address}
              onChange={setAddress}
              placeholder="Rua, número, bairro..."
              required
            />

            <Input
              label="CEP"
              value={cep}
              onChange={setCep}
              placeholder="00000-000"
              required
            />

            <Input
              label="Data de nascimento"
              value={birthDate}
              onChange={setBirthDate}
              type="date"
              required
            />

            <Input
              label="Valor do aluguel (R$)"
              value={rentValue}
              onChange={setRentValue}
              placeholder="Ex: 1200"
              required
            />
          </div>

          <div className="mt-6 flex flex-col md:flex-row gap-3">
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-purple-600 px-4 py-3 font-semibold hover:opacity-95 disabled:opacity-60"
            >
              {loading ? "Criando..." : "✅ Criar inquilino"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/owner/tenants")}
              className="rounded-xl bg-white/10 border border-white/10 px-4 py-3 font-semibold hover:bg-white/15"
            >
              Cancelar
            </button>
          </div>

          <div className="mt-6 text-white/40 text-xs">
            ✅ O inquilino será criado com senha padrão <b>123456</b> e será obrigado
            a trocar no primeiro login.
          </div>
        </form>
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <div className="text-sm font-semibold mb-2">{label}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        type={type}
        required={required}
        className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-white placeholder:text-white/30 outline-none focus:border-white/30"
      />
    </label>
  );
}

"use client";

import { useState } from "react";

function maskCPF(value: string) {
  value = value.replace(/\D/g, "").slice(0, 11);
  value = value.replace(/^(\d{3})(\d)/, "$1.$2");
  value = value.replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3");
  value = value.replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
  return value;
}

function maskDate(value: string) {
  value = value.replace(/\D/g, "").slice(0, 8);
  value = value.replace(/^(\d{2})(\d)/, "$1/$2");
  value = value.replace(/^(\d{2})\/(\d{2})(\d)/, "$1/$2/$3");
  return value;
}

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function handleCreateAccount() {
    setLoading(true);
    setMsg(null);

    try {
      const res = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          cpf,
          birthDate, // dd/mm/aaaa
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMsg(data?.error || "Erro ao criar conta.");
        return;
      }

      // ✅ manda pra login com aviso
      window.location.href = "/auth/sign-in?created=1";
    } catch (err) {
      setMsg("Erro interno.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <h1 className="text-2xl font-extrabold">Criar Conta</h1>
        <p className="mt-2 text-white/60 text-sm">
          Preencha os dados abaixo para criar seu acesso.
        </p>

        <div className="mt-6 space-y-3">
          <input
            className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 outline-none"
            placeholder="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 outline-none"
            placeholder="E-mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 outline-none"
            placeholder="CPF (000.000.000-00)"
            value={cpf}
            onChange={(e) => setCpf(maskCPF(e.target.value))}
          />

          <input
            className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 outline-none"
            placeholder="Data de nascimento (dd/mm/aaaa)"
            value={birthDate}
            onChange={(e) => setBirthDate(maskDate(e.target.value))}
          />

          <input
            className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 outline-none"
            placeholder="Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            onClick={handleCreateAccount}
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-purple-600 px-4 py-3 font-semibold hover:opacity-95 disabled:opacity-60"
          >
            {loading ? "Criando..." : "Criar conta"}
          </button>

          {msg ? (
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
              {msg}
            </div>
          ) : null}

          <p className="text-sm text-white/60">
            Já tem conta?{" "}
            <a className="underline hover:text-white" href="/auth/sign-in">
              Entrar
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

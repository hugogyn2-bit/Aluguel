"use client";

import { useState } from "react";

function maskCPF(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  const p1 = digits.slice(0, 3);
  const p2 = digits.slice(3, 6);
  const p3 = digits.slice(6, 9);
  const p4 = digits.slice(9, 11);

  if (digits.length <= 3) return p1;
  if (digits.length <= 6) return `${p1}.${p2}`;
  if (digits.length <= 9) return `${p1}.${p2}.${p3}`;
  return `${p1}.${p2}.${p3}-${p4}`;
}

function maskBirthDate(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);

  const d = digits.slice(0, 2);
  const m = digits.slice(2, 4);
  const y = digits.slice(4, 8);

  if (digits.length <= 2) return d;
  if (digits.length <= 4) return `${d}/${m}`;
  return `${d}/${m}/${y}`;
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [birthDate, setBirthDate] = useState("");

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [resetLink, setResetLink] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    setError(null);
    setResetLink(null);

    try {
      const res = await fetch("/api/auth/forgot-password/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          cpf,
          birthDate,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "Erro ao solicitar redefinição.");
        setLoading(false);
        return;
      }

      setMsg(data?.message || "Link gerado ✅");
      if (data?.resetLink) {
        setResetLink(data.resetLink);
      }
    } catch {
      setError("Erro interno ao enviar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <h1 className="text-2xl font-extrabold">Esqueci minha senha</h1>

        <p className="mt-2 text-white/70 text-sm">
          Digite os dados exatamente como foram cadastrados.
          Você receberá um link para redefinir sua senha.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm text-white/70">E-mail</label>
            <input
              type="email"
              placeholder="ex: seuemail@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 outline-none focus:border-white/30"
            />
          </div>

          <div>
            <label className="text-sm text-white/70">CPF</label>
            <input
              type="text"
              placeholder="000.000.000-00"
              value={cpf}
              onChange={(e) => setCpf(maskCPF(e.target.value))}
              required
              inputMode="numeric"
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 outline-none focus:border-white/30"
            />
          </div>

          <div>
            <label className="text-sm text-white/70">Data de nascimento</label>
            <input
              type="text"
              placeholder="dd/mm/aaaa"
              value={birthDate}
              onChange={(e) => setBirthDate(maskBirthDate(e.target.value))}
              required
              inputMode="numeric"
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 outline-none focus:border-white/30"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-purple-600 px-4 py-3 font-semibold hover:opacity-95 disabled:opacity-60"
          >
            {loading ? "Gerando link..." : "Gerar link de redefinição"}
          </button>

          {msg && (
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-green-200">
              {msg}
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          {resetLink && (
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
              <p className="font-semibold mb-2">✅ Link gerado:</p>

              <a href={resetLink} className="text-cyan-300 underline break-all">
                {resetLink}
              </a>

              <p className="mt-2 text-xs text-white/50">
                * Em produção, esse link deve ser enviado por e-mail.
              </p>
            </div>
          )}
        </form>

        <div className="mt-6 text-sm text-white/60">
          <a href="/auth/sign-in" className="underline text-white/80">
            Voltar para login
          </a>
        </div>
      </div>
    </div>
  );
}

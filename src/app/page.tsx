"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Glow background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-fuchsia-500/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-[520px] w-[520px] rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-[650px] w-[650px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-8">
        {/* Navbar */}
        <header className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              <span className="bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-purple-400 bg-clip-text text-transparent">
                Aluga • Painel do Proprietário
              </span>
            </h1>
            <p className="text-white/60 mt-2">
              Bem-vindo 👑 Você está logado como <b>OWNER</b>.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/owner"
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/10 transition"
            >
              Área do Owner
            </Link>

            <button
              onClick={() => signOut({ callbackUrl: "/auth/sign-in" })}
              className="rounded-xl bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-purple-600 px-4 py-2 text-sm font-bold text-white hover:opacity-95 transition"
            >
              Sair
            </button>
          </div>
        </header>

        {/* Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_0_40px_rgba(34,211,238,0.08)] backdrop-blur-xl">
            <h2 className="text-lg font-bold">🏠 Meus imóveis</h2>
            <p className="text-sm text-white/60 mt-2">
              Cadastre e gerencie suas propriedades.
            </p>

            <button className="mt-4 w-full rounded-xl bg-white/10 border border-white/10 px-4 py-2 font-semibold hover:bg-white/15 transition">
              Abrir
            </button>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_0_40px_rgba(236,72,153,0.08)] backdrop-blur-xl">
            <h2 className="text-lg font-bold">👥 Inquilinos</h2>
            <p className="text-sm text-white/60 mt-2">
              Veja, adicione e gerencie seus inquilinos.
            </p>

            <button className="mt-4 w-full rounded-xl bg-white/10 border border-white/10 px-4 py-2 font-semibold hover:bg-white/15 transition">
              Abrir
            </button>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_0_40px_rgba(168,85,247,0.08)] backdrop-blur-xl">
            <h2 className="text-lg font-bold">💳 Assinatura</h2>
            <p className="text-sm text-white/60 mt-2">
              Controle seu plano e pagamentos do OWNER.
            </p>

            <button className="mt-4 w-full rounded-xl bg-white/10 border border-white/10 px-4 py-2 font-semibold hover:bg-white/15 transition">
              Abrir
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-white/40">
          Aluga — Neon Access Portal ⚡
        </footer>
      </div>
    </main>
  );
}

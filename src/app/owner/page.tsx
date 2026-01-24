"use client";

import { useEffect, useState } from "react";

export default function OwnerDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [tenantsCount, setTenantsCount] = useState(0);
  const [trialActive, setTrialActive] = useState(true);
  const [premium, setPremium] = useState(false);

  async function loadData() {
    try {
      const res = await fetch("/api/owner/tenants/list");
      const data = await res.json();

      if (res.ok) {
        setTenantsCount((data.tenants || []).length);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white px-4 py-10">
      <div className="mx-auto w-full max-w-6xl">
        {/* TOP */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-extrabold">Owner Panel ⚡</h1>
            <p className="text-white/60 text-sm mt-1">
              Controle seus tenants, pagamentos e imóveis com estilo neon.
            </p>
          </div>

          <div className="flex gap-3">
            <a
              href="/owner/tenants/create"
              className="rounded-xl bg-white/10 border border-white/10 px-4 py-2 font-semibold hover:bg-white/15"
            >
              + Novo Tenant
            </a>

            <a
              href="/owner/premium"
              className="rounded-xl bg-gradient-to-r from-purple-600 via-fuchsia-500 to-pink-500 px-4 py-2 font-semibold hover:opacity-95"
            >
              Premium
            </a>
          </div>
        </div>

        {/* CARD */}
        <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl shadow-[0_0_80px_rgba(255,255,255,0.05)]">
          <h2 className="text-4xl font-extrabold">📊 Dashboard do Proprietário</h2>
          <p className="mt-2 text-white/70">{loading ? "Carregando..." : "Bem vindo, Hugo"}</p>

          {/* STATS */}
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-black/40 p-6">
              <div className="text-white/50 text-sm">Inquilinos cadastrados</div>
              <div className="text-4xl font-extrabold mt-2">{tenantsCount}</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/40 p-6">
              <div className="text-white/50 text-sm">Premium</div>
              <div className="text-2xl font-extrabold mt-2">
                {premium ? "✅ Sim" : "❌ Não"}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/40 p-6">
              <div className="text-white/50 text-sm">Trial</div>
              <div className="text-2xl font-extrabold mt-2">
                {trialActive ? "✅ Ativo" : "❌ Expirado"}
              </div>
            </div>
          </div>

          {/* BOTÕES DO PRINT ✅ */}
          <div className="mt-8 grid gap-4 md:grid-cols-4">
            <a
              href="/owner/tenants"
              className="rounded-2xl bg-white/10 border border-white/10 px-5 py-4 font-bold hover:bg-white/15"
            >
              👥 Meus Inquilinos
            </a>

            <a
              href="/owner/tenants/create"
              className="rounded-2xl bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-purple-600 px-5 py-4 font-bold hover:opacity-95"
            >
              ➕ Novo Inquilino
            </a>

            <a
              href="/owner/settings"
              className="rounded-2xl bg-white/10 border border-white/10 px-5 py-4 font-bold hover:bg-white/15"
            >
              ⚙️ Configurações
            </a>

            <a
              href="/owner/premium"
              className="rounded-2xl bg-white/10 border border-white/10 px-5 py-4 font-bold hover:bg-white/15"
            >
              💳 Premium
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

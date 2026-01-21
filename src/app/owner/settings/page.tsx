"use client";

import Link from "next/link";

export default function OwnerSettingsPage() {
  return (
    <div className="min-h-screen bg-black text-white px-6 py-12">
      <div className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
        <h1 className="text-3xl font-extrabold mb-2">⚙️ Configurações</h1>
        <p className="text-white/60 mb-8">
          Página de configurações do proprietário (você pode expandir depois).
        </p>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="text-white/70">
            ✅ Aqui você pode colocar:
          </p>

          <ul className="mt-3 text-white/60 text-sm list-disc pl-5 space-y-1">
            <li>Dados do proprietário</li>
            <li>Configurações de notificações</li>
            <li>Preferências do sistema</li>
            <li>Configuração de cobrança</li>
          </ul>
        </div>

        <div className="mt-10 flex gap-3 flex-wrap">
          <Link
            href="/owner/dashboard"
            className="rounded-xl px-4 py-3 bg-white/10 border border-white/10 hover:bg-white/15 transition"
          >
            ← Dashboard
          </Link>

          <Link
            href="/owner"
            className="rounded-xl px-4 py-3 bg-white/10 border border-white/10 hover:bg-white/15 transition"
          >
            ← Área do Proprietário
          </Link>
        </div>
      </div>
    </div>
  );
}

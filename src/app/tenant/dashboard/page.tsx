"use client";

import { useEffect, useState } from "react";

type TenantData = {
  fullName: string;
  cpf: string;
  rg: string;
  address: string;
  cep: string;
  birthDate: string | null;
};

export default function TenantDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [tenant, setTenant] = useState<TenantData | null>(null);
  const [msg, setMsg] = useState("");

  async function loadTenant() {
    setLoading(true);
    setMsg("");

    try {
      const res = await fetch("/api/tenant/me");
      const data = await res.json();

      if (!res.ok) {
        setMsg(data?.error || "Erro ao carregar dados do inquilino");
        setLoading(false);
        return;
      }

      setTenant(data);
    } catch {
      setMsg("Erro interno.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTenant();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Carregando...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 py-10">
      <div className="mx-auto w-full max-w-2xl rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <h1 className="text-2xl font-extrabold">Painel do Inquilino</h1>
        <p className="mt-2 text-white/60">
          Aqui você vê apenas seus dados cadastrados pelo proprietário.
        </p>

        {msg ? (
          <div className="mt-6 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
            {msg}
          </div>
        ) : null}

        {tenant ? (
          <div className="mt-6 space-y-3 text-sm text-white/80">
            <Card label="Nome" value={tenant.fullName} />
            <Card label="CPF" value={tenant.cpf} />
            <Card label="RG" value={tenant.rg} />
            <Card label="Endereço" value={tenant.address} />
            <Card label="CEP" value={tenant.cep} />
            <Card
              label="Data de nascimento"
              value={tenant.birthDate ? tenant.birthDate : "Não informado"}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-4">
      <div className="text-white/50">{label}</div>
      <div className="text-white font-semibold">{value}</div>
    </div>
  );
}

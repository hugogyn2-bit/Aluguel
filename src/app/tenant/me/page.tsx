"use client";

import { useEffect, useState } from "react";

type MeData = {
  email: string;
  name: string | null;
  role: string;

  tenantProfile?: {
    fullName: string;
    cpf: string;
    rg: string;
    address: string;
    cep: string;
    phone: string | null;
  } | null;
};

export default function TenantMePage() {
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<MeData | null>(null);
  const [msg, setMsg] = useState("");

  async function loadMe() {
    setLoading(true);
    setMsg("");

    try {
      const res = await fetch("/api/tenant/me");
      const data = await res.json();

      if (!res.ok) {
        setMsg(data?.error || "Erro ao buscar seus dados.");
        return;
      }

      setMe(data.me);
    } catch {
      setMsg("Erro interno.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMe();
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        Carregando...
      </div>
    );
  }

  if (!me) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-bold">Meus dados</h2>
        <p className="mt-2 text-white/70">{msg || "Não encontrado."}</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
      <h2 className="text-2xl font-extrabold">👤 Meus dados</h2>

      {msg ? (
        <div className="mt-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
          {msg}
        </div>
      ) : null}

      <div className="mt-6 grid gap-3 md:grid-cols-2 text-sm">
        <div className="rounded-xl bg-white/5 border border-white/10 p-4">
          <div className="text-white/60">E-mail</div>
          <div className="font-semibold">{me.email}</div>
        </div>

        <div className="rounded-xl bg-white/5 border border-white/10 p-4">
          <div className="text-white/60">Nome</div>
          <div className="font-semibold">{me.name || "-"}</div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">
        <h3 className="font-bold text-lg">📌 Perfil do Inquilino</h3>

        {!me.tenantProfile ? (
          <p className="mt-2 text-white/70">
            Seu perfil ainda não foi cadastrado pelo proprietário.
          </p>
        ) : (
          <div className="mt-4 grid gap-3 md:grid-cols-2 text-sm">
            <div className="rounded-xl bg-black/30 border border-white/10 p-4">
              <div className="text-white/60">Nome completo</div>
              <div className="font-semibold">{me.tenantProfile.fullName}</div>
            </div>

            <div className="rounded-xl bg-black/30 border border-white/10 p-4">
              <div className="text-white/60">Telefone</div>
              <div className="font-semibold">{me.tenantProfile.phone || "-"}</div>
            </div>

            <div className="rounded-xl bg-black/30 border border-white/10 p-4">
              <div className="text-white/60">CPF</div>
              <div className="font-semibold">{me.tenantProfile.cpf}</div>
            </div>

            <div className="rounded-xl bg-black/30 border border-white/10 p-4">
              <div className="text-white/60">RG</div>
              <div className="font-semibold">{me.tenantProfile.rg}</div>
            </div>

            <div className="rounded-xl bg-black/30 border border-white/10 p-4 md:col-span-2">
              <div className="text-white/60">Endereço</div>
              <div className="font-semibold">{me.tenantProfile.address}</div>
            </div>

            <div className="rounded-xl bg-black/30 border border-white/10 p-4">
              <div className="text-white/60">CEP</div>
              <div className="font-semibold">{me.tenantProfile.cep}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

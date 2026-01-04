"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

export function SignInForm() {
  const router = useRouter();
  const sp = useSearchParams();

  const role = useMemo(() => {
    return (sp.get("role") === "OWNER" ? "OWNER" : "TENANT") as "OWNER" | "TENANT";
  }, [sp]);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setErr(null);

    try {
      const fd = new FormData(e.currentTarget);
      const email = String(fd.get("email") ?? "").trim().toLowerCase();
      const password = String(fd.get("password") ?? "");

      if (!email || !password) {
        setErr("Preencha e-mail e senha.");
        return;
      }

      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
        role,
      });

      if (!res?.ok) {
        // NextAuth com Credentials geralmente não retorna detalhes
        setErr("E-mail ou senha inválidos (ou role errado).");
        return;
      }

      // ✅ deixa o middleware decidir (trial/pago/paywall)
      // OWNER: tenta /owner (vai pro /paywall se não pago e sem trial)
      // TENANT: vai pro /tenant
      router.replace(role === "OWNER" ? "/owner" : "/tenant");
      router.refresh();
    } catch (e: any) {
      setErr(e?.message || "Erro inesperado ao entrar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ display: "grid", gap: 12, marginTop: 16 }}>
      <input name="email" type="email"

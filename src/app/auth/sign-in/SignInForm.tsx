"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function SignInForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const role = (sp.get("role") === "OWNER" ? "OWNER" : "TENANT") as
    | "OWNER"
    | "TENANT";

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErr(null);

    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").trim().toLowerCase();
    const password = String(fd.get("password") ?? "");

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
      role,
    });

    setLoading(false);

    if (!res?.ok) {
      setErr("E-mail ou senha inválidos.");
      return;
    }

    // ✅ Redirect final: chama um endpoint que decide pelo role do usuário logado
    router.push("/api/post-login");
  }

  return (
    <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <input name="email" type="email" placeholder="Email" required />
        <input name="password" type="password" placeholder="Senha" required />
        <button type="submit" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </button>
        {err ? <p style={{ color: "crimson" }}>{err}</p> : null}
      </form>

      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 14, opacity: 0.85 }}>
        {role === "OWNER" ? (
          <a href="/auth/sign-up?role=OWNER">Criar conta (proprietário)</a>
        ) : (
          <span />
        )}

        {role === "OWNER" ? (
          <a href="/auth/forgot-password">Esqueci minha senha</a>
        ) : (
          <span />
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 12, opacity: 0.7 }}>
        <a href="/auth/sign-in?role=TENANT">Entrar como inquilino</a>
        <a href="/auth/sign-in?role=OWNER">Entrar como proprietário</a>
      </div>
    </div>
  );
}

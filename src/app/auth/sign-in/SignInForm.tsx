"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

export function SignInForm() {
  const router = useRouter();
  const sp = useSearchParams();

  const created = useMemo(() => sp.get("created") === "1", [sp]);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErr(null);

    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").trim();
    const password = String(fd.get("password") ?? "");

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    setLoading(false);

    if (!res?.ok) {
      setErr("E-mail ou senha inválidos.");
      return;
    }

    // decide o destino no server (tenant/owner)
    router.push("/api/post-login");
  }

  return (
    <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
      {created ? (
        <div
          style={{
            padding: 10,
            borderRadius: 10,
            background: "rgba(16, 185, 129, 0.12)",
            border: "1px solid rgba(16, 185, 129, 0.25)",
            fontSize: 14,
          }}
        >
          Conta criada com sucesso.
        </div>
      ) : null}

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <input name="email" type="email" placeholder="Email" required />
        <input name="password" type="password" placeholder="Senha" required />

        <button type="submit" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </button>

        {err ? <p style={{ color: "crimson", margin: 0 }}>{err}</p> : null}
      </form>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", fontSize: 14, opacity: 0.85 }}>
        <a href="/auth/sign-up">Criar conta (proprietário)</a>
        <span>•</span>
        <a href="/auth/forgot-password">Esqueci minha senha (proprietário)</a>
      </div>
    </div>
  );
}

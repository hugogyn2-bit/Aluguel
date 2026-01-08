"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SignInForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErr(null);

    const fd = new FormData(e.currentTarget);
    const identifier = String(fd.get("identifier") ?? "").trim();
    const password = String(fd.get("password") ?? "");

    const res = await signIn("credentials", {
      redirect: false,
      identifier,
      password,
    });

    setLoading(false);

    if (!res?.ok) {
      setErr("E-mail ou senha inválidos.");
      return;
    }

    // redireciona conforme role via middleware / páginas
    // (vamos mandar para /owner por padrão; se for TENANT, middleware manda para /tenant)
    router.push("/owner");
  }

  return (
    <form onSubmit={onSubmit} style={{ display: "grid", gap: 12, marginTop: 16 }}>
      <input name="identifier" type="email" placeholder="Email" required />
      <input name="password" type="password" placeholder="Senha" required />
      <button type="submit" disabled={loading}>
        {loading ? "Entrando..." : "Entrar"}
      </button>
      {err ? <p style={{ color: "crimson" }}>{err}</p> : null}
    </form>
  );
}

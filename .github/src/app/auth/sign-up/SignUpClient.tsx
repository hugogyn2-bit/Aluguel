"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function SignInClient() {
  const sp = useSearchParams();
  const router = useRouter();
  const role = sp.get("role") === "OWNER" ? "OWNER" : "TENANT";

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

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

    if (!res || res.error) {
      setError("E-mail, senha ou tipo de conta inválidos.");
      return;
    }

    router.push(role === "OWNER" ? "/owner" : "/tenant");
  }

  return (
    <main style={{ maxWidth: 420, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>Entrar</h1>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12, marginTop: 16 }}>
        <input name="email" type="email" placeholder="Email" required />
        <input name="password" type="password" placeholder="Senha" required />
        <button type="submit" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>

      {error && <p style={{ color: "crimson", marginTop: 12 }}>{error}</p>}

      <p style={{ marginTop: 16, fontSize: 14, opacity: 0.7 }}>
        Não tem conta?{" "}
        <a href={`/auth/sign-up?role=${role}`}>Criar conta</a>
      </p>
    </main>
  );
}

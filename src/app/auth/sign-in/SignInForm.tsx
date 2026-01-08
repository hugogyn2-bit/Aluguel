"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function SignInForm() {
  const router = useRouter();
  const sp = useSearchParams();

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // mensagem vinda do cadastro / reset
  const success = sp.get("created") === "1";
  const resetOk = sp.get("reset") === "1";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErr(null);

    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").trim(); // Email ou CPF
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

    // Descobre o role pela sessão e redireciona
    try {
      const session = await fetch("/api/auth/session", { cache: "no-store" })
        .then((r) => r.json())
        .catch(() => null);

      const role = session?.user?.role as "OWNER" | "TENANT" | undefined;
      router.push(role === "OWNER" ? "/owner" : "/tenant");
    } catch {
      // fallback
      router.push("/");
    }
  }

  return (
    <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
      {success ? (
        <p style={{ color: "green", fontSize: 14 }}>Usuário criado com sucesso.</p>
      ) : null}

      {resetOk ? (
        <p style={{ color: "green", fontSize: 14 }}>Senha redefinida com sucesso. Faça login.</p>
      ) : null}

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <input name="email" type="text" placeholder="Email ou CPF" required />
        <input name="password" type="password" placeholder="Senha" required />

        <button type="submit" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </button>

        {err ? <p style={{ color: "crimson" }}>{err}</p> : null}
      </form>
    </div>
  );
}

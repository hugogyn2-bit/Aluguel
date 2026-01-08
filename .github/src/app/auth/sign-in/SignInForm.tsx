"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

export function SignInForm() {
  const router = useRouter();
  const sp = useSearchParams();

  // opcional: permite /auth/sign-in?next=/owner/tenants
  const nextUrl = useMemo(() => sp.get("next") || "", [sp]);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErr(null);

    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "");
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

    // se tiver next, vai pra lá; senão decide no backend (middleware vai ajustar)
    router.push(nextUrl || "/");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 mt-4">
      <input name="email" type="email" placeholder="Email" required className="border rounded p-2" />
      <input name="password" type="password" placeholder="Senha" required className="border rounded p-2" />

      <button type="submit" disabled={loading} className="rounded bg-black text-white p-2">
        {loading ? "Entrando..." : "Entrar"}
      </button>

      {err ? <p className="text-sm text-red-600">{err}</p> : null}
    </form>
  );
}

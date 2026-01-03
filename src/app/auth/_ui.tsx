"use client";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/cn";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useMemo, useState } from "react";

export function AuthShell({
  title,
  subtitle,
  role,
  mode,
  action,
}: {
  title: string;
  subtitle: string;
  role: "TENANT" | "OWNER";
  mode: "sign-in" | "sign-up";
  action: (data: FormData) => Promise<{ ok: boolean; error?: string; redirectTo?: string }>;
}) {
  const badge = role === "OWNER" ? "bg-accent/15 text-accent border-accent/30" : "bg-secondary/15 text-secondary border-secondary/30";
  const roleLabel = role === "OWNER" ? "Proprietário" : "Inquilino";
  const swapHref = mode === "sign-in" ? `/auth/sign-up?role=${role}` : `/auth/sign-in?role=${role}`;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hints = useMemo(() => {
    return role === "OWNER"
      ? ["Após cadastro/login, você será direcionado ao paywall se ainda não ativou o plano.", "Clique em “Pagar depois” para testar o bloqueio."]
      : ["Acesso padrão sem paywall.", "Perfeito para boletos, contratos e chamados."];
  }, [role]);

  return (
    <main className="mx-auto max-w-md px-5 py-10">
      <div className="flex items-start justify-between gap-4">
        <Logo />
        <Link className="text-xs text-muted hover:text-text mt-2" href="/">Voltar</Link>
      </div>

      <Card className="mt-8 p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight">{title}</h1>
            <p className="text-sm text-muted mt-1">{subtitle}</p>
          </div>
          <div className={cn("px-3 py-1 rounded-full border text-xs font-bold", badge)}>
            {roleLabel}
          </div>
        </div>

        <form
          className="mt-6 grid gap-3"
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);
            setError(null);
            const fd = new FormData(e.currentTarget);
            const res = await action(fd);
            setLoading(false);
            if (!res.ok) setError(res.error ?? "Falha");
            if (res.ok && mode === "sign-in") {
              // NextAuth handled redirect in parent
            } else if (res.ok && res.redirectTo) {
              window.location.href = res.redirectTo;
            }
          }}
        >
          <label className="grid gap-1">
            <span className="text-sm text-muted">Email</span>
            <input
              name="email"
              type="email"
              required
              className="h-12 rounded-2xl bg-surface border border-white/10 px-4 outline-none focus:border-white/25"
              placeholder="voce@exemplo.com"
            />
          </label>

          {mode === "sign-up" ? (
            <label className="grid gap-1">
              <span className="text-sm text-muted">Nome (opcional)</span>
              <input
                name="name"
                type="text"
                className="h-12 rounded-2xl bg-surface border border-white/10 px-4 outline-none focus:border-white/25"
                placeholder="Seu nome"
              />
            </label>
          ) : null}

          <label className="grid gap-1">
            <span className="text-sm text-muted">Senha</span>
            <input
              name="password"
              type="password"
              minLength={6}
              required
              className="h-12 rounded-2xl bg-surface border border-white/10 px-4 outline-none focus:border-white/25"
              placeholder="••••••••"
            />
          </label>

          {error ? (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          ) : null}

          <Button loading={loading} type="submit">
            {mode === "sign-in" ? "Entrar" : "Criar conta"}
          </Button>

          <div className="flex items-center justify-between text-sm mt-1">
            <Link className="text-muted hover:text-text" href={swapHref}>
              {mode === "sign-in" ? "Não tem conta? Criar agora" : "Já tem conta? Entrar"}
            </Link>
            {mode === "sign-in" ? (
              <button
                type="button"
                className="text-muted hover:text-text"
                onClick={async () => {
                  const email = (document.querySelector('input[name="email"]') as HTMLInputElement)?.value ?? "";
                  const password = (document.querySelector('input[name="password"]') as HTMLInputElement)?.value ?? "";
                  setLoading(true);
                  setError(null);
                  const r = await signIn("credentials", {
                    email,
                    password,
                    redirect: true,
                    callbackUrl: role === "OWNER" ? "/owner" : "/tenant",
                  });
                  setLoading(false);
                  if ((r as any)?.error) setError((r as any).error);
                }}
              >
                Entrar (NextAuth)
              </button>
            ) : null}
          </div>

          <div className="mt-4 rounded-3xl border border-white/10 bg-black/15 p-4">
            <div className="text-xs font-bold text-text mb-2">Dicas</div>
            <ul className="text-xs text-muted list-disc pl-5 space-y-1">
              {hints.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          </div>
        </form>
      </Card>
    </main>
  );
}

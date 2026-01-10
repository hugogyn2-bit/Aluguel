"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";

export default function SignInPage() {
  const router = useRouter();
  const params = useSearchParams();

  const created = params.get("created");
  const changed = params.get("changed");
  const reset = params.get("reset");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (!res || res.error) {
      setError("E-mail ou senha inválidos.");
      return;
    }

    router.push("/api/post-login");
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-5">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-black tracking-tight">Login</h1>
        </div>

        {/* Success messages */}
        {created && (
          <p className="text-sm text-green-600 font-medium">
            Conta criada com sucesso. Faça login.
          </p>
        )}

        {changed && (
          <p className="text-sm text-green-600 font-medium">
            Senha alterada com sucesso. Faça login novamente.
          </p>
        )}

        {reset && (
          <p className="text-sm text-green-600 font-medium">
            Senha redefinida com sucesso. Faça login.
          </p>
        )}

        {/* Error message */}
        {error && (
          <p className="text-sm text-red-500 font-medium">{error}</p>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        {/* Actions */}
        <div className="space-y-3 text-center">
          <Link
            href="/auth/sign-up"
            className="block text-sm underline opacity-90"
          >
            Criar conta
          </Link>

          <Link
            href="/auth/forgot-password"
            className="block text-sm underline opacity-90"
          >
            Esqueci minha senha
          </Link>
        </div>
      </div>
    </main>
  );
}

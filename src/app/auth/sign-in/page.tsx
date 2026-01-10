"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/Button";

export default function SignInPage() {
  const router = useRouter();

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
        <h1 className="text-3xl font-black tracking-tight">Login</h1>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full rounded-xl border px-4 py-3"
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            className="w-full rounded-xl border px-4 py-3"
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

        <div className="text-center space-y-2">
          <Link href="/auth/sign-up" className="text-sm underline">
            Criar conta
          </Link>
          <br />
          <Link href="/auth/forgot-password" className="text-sm underline">
            Esqueci minha senha
          </Link>
        </div>
      </div>
    </main>
  );
}

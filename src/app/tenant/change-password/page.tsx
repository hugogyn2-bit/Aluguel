"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

export default function ChangePasswordPage() {
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      alert("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (password !== password2) {
      alert("As senhas não conferem.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/tenant/change-password", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      alert(data?.error ?? "Erro ao trocar senha.");
      return;
    }

    // 🔁 Importante: o JWT do NextAuth não muda automaticamente.
    // Para aplicar mustChangePassword=false no token, fazemos logout e o usuário entra com a nova senha.
    await signOut({ callbackUrl: "/auth/sign-in?changed=1" });
    router.push("/auth/sign-in?changed=1");
  }

  return (
    <main className="mx-auto max-w-md px-5 py-10">
      <h1 className="text-2xl font-black tracking-tight">Defina sua nova senha</h1>
      <p className="text-sm text-muted mt-2">
        Por segurança, você precisa trocar a senha temporária antes de acessar o sistema.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-3">
        <input
          className="w-full rounded-2xl bg-surface/90 border border-white/10 px-4 py-3"
          type="password"
          placeholder="Nova senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          required
        />
        <input
          className="w-full rounded-2xl bg-surface/90 border border-white/10 px-4 py-3"
          type="password"
          placeholder="Confirmar nova senha"
          value={password2}
          onChange={(e) => setPassword2(e.target.value)}
          autoComplete="new-password"
          required
        />

        <button
          className="w-full rounded-2xl bg-white/90 text-black font-bold py-3 disabled:opacity-60"
          type="submit"
          disabled={loading}
        >
          {loading ? "Salvando..." : "Salvar senha"}
        </button>
      </form>
    </main>
  );
}

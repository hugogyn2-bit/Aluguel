import Link from "next/link";
import { Suspense } from "react";
import { SignInForm } from "./SignInForm";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ created?: string }>;
}) {
  const sp = await searchParams;

  return (
    <main style={{ maxWidth: 420, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>Entrar</h1>
      <p style={{ opacity: 0.7, marginTop: 8 }}>Acesse sua conta para continuar.</p>

      {sp?.created === "1" ? (
        <p style={{ marginTop: 12, padding: 10, borderRadius: 10, background: "#0b3", color: "white" }}>
          Usuário criado com sucesso.
        </p>
      ) : null}

      <Suspense fallback={null}>
        <SignInForm />
      </Suspense>

      <p style={{ marginTop: 16, fontSize: 14, opacity: 0.7 }}>
        Não tem conta? <Link href="/auth/sign-up">Criar conta</Link>
      </p>
      <p style={{ marginTop: 8, fontSize: 14, opacity: 0.7 }}>
        Esqueceu a senha? <Link href="/auth/forgot-password">Recuperar</Link>
      </p>
    </main>
  );
}

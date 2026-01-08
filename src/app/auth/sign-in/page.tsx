import { Suspense } from "react";
import { SignInForm } from "./SignInForm";

export default function Page() {
  return (
    <main style={{ maxWidth: 420, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>Entrar</h1>
      <p style={{ opacity: 0.7, marginTop: 8 }}>Acesse sua conta para continuar.</p>

      <Suspense fallback={null}>
        <SignInForm />
      </Suspense>

      <p style={{ marginTop: 16, fontSize: 14, opacity: 0.7 }}>
        Não tem conta? <a href="/auth/sign-up">Criar conta</a>
      </p>

      <p style={{ marginTop: 8, fontSize: 14, opacity: 0.7 }}>
        Esqueceu a senha? <a href="/auth/forgot-password">Recuperar senha</a>
      </p>
    </main>
  );
}

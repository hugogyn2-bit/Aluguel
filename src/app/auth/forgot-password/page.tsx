import { Suspense } from "react";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

export default function Page() {
  return (
    <main style={{ maxWidth: 420, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>Esqueci minha senha </h1>
      <p style={{ opacity: 0.7, marginTop: 8 }}>
        Defina uma nova senha para sua conta de proprietário.
      </p>

      <Suspense fallback={null}>
        <ForgotPasswordForm />
      </Suspense>

      <p style={{ marginTop: 16, fontSize: 14, opacity: 0.7 }}>
        Voltar para <a href="/auth/sign-in?role=OWNER">Entrar</a>
      </p>
    </main>
  );
}

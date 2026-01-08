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
    </main>
  );
}

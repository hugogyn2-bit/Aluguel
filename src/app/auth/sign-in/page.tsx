import { AuthShell } from "../_ui";
import { Suspense } from "react";
import { SignInForm } from "./SignInForm";

export default function Page() {
  return (
    <AuthShell title="Entrar" subtitle="Acesse sua conta para continuar.">
      <Suspense fallback={null}>
        <SignInForm />
      </Suspense>
      <a className="text-sm underline mt-4 inline-block" href="/auth/sign-up">
        Criar conta de proprietário
      </a>
    </AuthShell>
  );
}

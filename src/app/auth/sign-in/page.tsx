import { Suspense } from "react";
import SignInForm from "./SignInForm";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-extrabold text-white">Aluga</h1>
          <p className="mt-2 text-white/60">
            Faça login para acessar sua conta
          </p>
        </div>

        <Suspense fallback={<p className="text-white/60">Carregando...</p>}>
          <SignInForm />
        </Suspense>

        <p className="mt-6 text-center text-xs text-white/40">
          © {new Date().getFullYear()} Aluga. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}

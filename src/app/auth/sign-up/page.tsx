import { Suspense } from "react";
import SignUpForm from "./SignUpForm";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-extrabold text-white">Aluga</h1>
          <p className="mt-2 text-white/60">
            Crie sua conta para começar a usar
          </p>
        </div>

        <Suspense fallback={<p className="text-white/60">Carregando...</p>}>
          <SignUpForm />
        </Suspense>

        <p className="mt-6 text-center text-xs text-white/40">
          Já tem conta?{" "}
          <a href="/auth/sign-in" className="text-white hover:underline">
            Entrar
          </a>
        </p>
      </div>
    </div>
  );
}

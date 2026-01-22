import ForgotPasswordForm from "./ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-extrabold text-white">Aluga</h1>
          <p className="mt-2 text-white/60">
            Digite seu e-mail para redefinir sua senha
          </p>
        </div>

        <ForgotPasswordForm />

        <p className="mt-6 text-center text-xs text-white/40">
          <a href="/auth/sign-in" className="text-white hover:underline">
            Voltar para login
          </a>
        </p>
      </div>
    </div>
  );
}

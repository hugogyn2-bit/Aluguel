import { Suspense } from "react";
import ResetPasswordClient from "./reset-client";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetLoading />}>
      <ResetPasswordClient />
    </Suspense>
  );
}

function ResetLoading() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <h1 className="text-2xl font-extrabold">Carregando...</h1>
        <p className="mt-2 text-white/70 text-sm">
          Aguarde um instante.
        </p>
      </div>
    </div>
  );
}

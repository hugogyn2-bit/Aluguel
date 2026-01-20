import { Suspense } from "react";
import ResetPasswordClient from "./ResetPasswordClient";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-white p-6">Carregando...</div>}>
      <ResetPasswordClient />
    </Suspense>
  );
}

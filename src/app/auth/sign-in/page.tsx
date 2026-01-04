import { Suspense } from "react";
import SignInClient from "./SignInClient";

export const dynamic = "force-dynamic"; // extra: evita pre-render chato em auth

export default function Page() {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Carregando...</div>}>
      <SignInClient />
    </Suspense>
  );
}

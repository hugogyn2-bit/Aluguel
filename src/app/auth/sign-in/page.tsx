import { Suspense } from "react";
import { SignInForm } from "./SignInForm";

export default function SignInPage() {
  return (
    <main style={{ maxWidth: 420, margin: "0 auto", padding: 24 }}>
      <h1>Login</h1>

      <Suspense fallback={null}>
        <SignInForm />
      </Suspense>
    </main>
  );
}

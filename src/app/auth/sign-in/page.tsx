import { Suspense } from "react";
import { SignInForm } from "./SignInForm";

export default function SignInPage() {
  return (
    <div className="w-full max-w-md space-y-6">
      <h1 className="text-3xl font-bold">Login</h1>

      <Suspense fallback={null}>
        <SignInForm />
      </Suspense>
    </div>
  );
}

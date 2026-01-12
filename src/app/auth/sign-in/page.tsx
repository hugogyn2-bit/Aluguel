import { SignInForm } from "./SignInForm";

export default function SignInPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        <h1 className="text-3xl font-bold">Login</h1>
        <SignInForm />
      </div>
    </main>
  );
}

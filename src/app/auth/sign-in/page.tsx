"use client";

import { signIn } from "next-auth/react";

export default function SignInPage() {
  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email"));
    const password = String(formData.get("password"));

    await signIn("credentials", {
      email,
      password,
      redirect: true,
      callbackUrl: "/",
    });
  }

  return (
    <form onSubmit={handleLogin}>
      <input name="email" />
      <input name="password" type="password" />
      <button type="submit">Entrar</button>
    </form>
  );
}

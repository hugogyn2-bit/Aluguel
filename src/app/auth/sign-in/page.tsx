"use client";

import { signIn } from "next-auth/react";

export default function SignInPage() {
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
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
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <form
        onSubmit={handleSubmit}
        style={{
          width: 350,
          padding: 20,
          border: "1px solid #ccc",
          borderRadius: 12,
          background: "white",
        }}
      >
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>
          Login
        </h1>

        <input
          name="email"
          placeholder="Email"
          style={{ width: "100%", padding: 10, marginBottom: 10 }}
        />
        <input
          name="password"
          type="password"
          placeholder="Senha"
          style={{ width: "100%", padding: 10, marginBottom: 10 }}
        />

        <button style={{ width: "100%", padding: 10 }}>Entrar</button>
      </form>
    </div>
  );
}

import Link from "next/link";

export default function HomePage() {
  return (
    <main style={{ maxWidth: 420, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 24, fontWeight: 800 }}>Aluguel</h1>
      <p style={{ opacity: 0.7, marginTop: 8 }}>Entre para continuar.</p>

      <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
        <Link href="/auth/sign-in">Ir para login</Link>
        <Link href="/auth/sign-up">Criar conta</Link>
        <Link href="/auth/forgot-password">Esqueci minha senha</Link>
      </div>
    </main>
  );
}

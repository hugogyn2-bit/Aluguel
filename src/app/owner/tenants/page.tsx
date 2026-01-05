import { createTenantAction } from "./actions";

export default function Page() {
  return (
    <main style={{ maxWidth: 700, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 24, fontWeight: 800 }}>Inquilinos</h1>
      <p style={{ opacity: 0.7, marginTop: 8 }}>
        Crie um acesso de inquilino (ele poderá trocar a senha depois).
      </p>

      <form action={createTenantAction} style={{ display: "grid", gap: 12, marginTop: 16 }}>
        <input name="fullName" placeholder="Nome completo" required />
        <input name="email" type="email" placeholder="Email do inquilino" required />
        <input name="phone" placeholder="Telefone (opcional)" />
        <input name="tempPassword" type="password" placeholder="Senha temporária (mín 6)" minLength={6} required />
        <button type="submit">Criar inquilino</button>
      </form>

      <p style={{ marginTop: 12, fontSize: 12, opacity: 0.7 }}>
        Dica: envie o e-mail e a senha temporária para o inquilino. Depois ele troca.
      </p>
    </main>
  );
}

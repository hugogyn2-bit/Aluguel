import { createTenantAction } from "./actions";
import { redirect } from "next/navigation";

export default async function Page() {
  async function action(fd: FormData) {
    "use server";
    const res = await createTenantAction(fd);
    if (res.ok) {
      // ✅ redirect final (pode trocar depois)
      redirect("/owner/tenants?created=1");
    }
    return res;
  }

  return (
    <main style={{ maxWidth: 720, margin: "32px auto", padding: 16 }}>
      <h1 style={{ fontSize: 26, fontWeight: 800 }}>Inquilinos</h1>
      <p style={{ opacity: 0.75, marginTop: 6 }}>
        Crie um acesso de inquilino (email + senha) e salve os dados.
      </p>

      <section style={{ marginTop: 18, border: "1px solid #ddd", borderRadius: 12, padding: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>Criar inquilino</h2>

        <form action={action} style={{ display: "grid", gap: 12, marginTop: 12 }}>
          <div style={{ display: "grid", gap: 8 }}>
            <label style={{ fontSize: 14, fontWeight: 600 }}>Email</label>
            <input name="email" type="email" placeholder="inquilino@email.com" required />
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            <label style={{ fontSize: 14, fontWeight: 600 }}>Senha inicial</label>
            <input name="password" type="password" placeholder="Senha temporária" minLength={4} required />
            <small style={{ opacity: 0.7 }}>
              O inquilino poderá alterar depois (vamos criar essa tela depois).
            </small>
          </div>

          <hr style={{ margin: "6px 0" }} />

          <div style={{ display: "grid", gap: 8 }}>
            <label style={{ fontSize: 14, fontWeight: 600 }}>Nome completo</label>
            <input name="fullName" placeholder="Nome completo" required />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ display: "grid", gap: 8 }}>
              <label style={{ fontSize: 14, fontWeight: 600 }}>CPF</label>
              <input name="cpf" placeholder="000.000.000-00" required />
            </div>

            <div style={{ display: "grid", gap: 8 }}>
              <label style={{ fontSize: 14, fontWeight: 600 }}>RG</label>
              <input name="rg" placeholder="RG" required />
            </div>
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            <label style={{ fontSize: 14, fontWeight: 600 }}>Endereço</label>
            <input name="address" placeholder="Rua, número, bairro, cidade/UF" required />
          </div>

          <div style={{ display: "grid", gap: 8, maxWidth: 220 }}>
            <label style={{ fontSize: 14, fontWeight: 600 }}>CEP</label>
            <input name="cep" placeholder="00000-000" required />
          </div>

          <button type="submit" style={{ padding: 12, borderRadius: 10, fontWeight: 700 }}>
            Criar inquilino
          </button>
        </form>
      </section>
    </main>
  );
}

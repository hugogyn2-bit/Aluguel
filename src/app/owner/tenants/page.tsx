import { TenantsCreateForm } from "./tenants-create-form";
import { TenantsList } from "./tenants-list";

export default function Page() {
  return (
    <main style={{ maxWidth: 900, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 24, fontWeight: 800 }}>Inquilinos</h1>
      <p style={{ opacity: 0.7, marginTop: 6 }}>
        Crie o acesso do inquilino. A senha padrão será o CPF (11 números).
      </p>

      <div style={{ display: "grid", gap: 16, marginTop: 16 }}>
        <TenantsCreateForm />
        <TenantsList />
      </div>
    </main>
  );
}

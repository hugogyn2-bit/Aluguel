import TenantsCreateForm from "./tenants-create-form";

export default function Page() {
  return (
    <main style={{ maxWidth: 760, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 26, fontWeight: 800 }}>Inquilinos</h1>
      <p style={{ opacity: 0.7, marginTop: 8 }}>
        Aqui o proprietário cria o acesso do inquilino (conta separada).
      </p>

      <div style={{ marginTop: 18 }}>
        <TenantsCreateForm />
      </div>
    </main>
  );
}

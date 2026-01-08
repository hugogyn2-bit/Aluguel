import { TenantsList } from "../tenants/tenants-list";

export default function Page() {
  return (
    <main style={{ maxWidth: 900, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 24, fontWeight: 800 }}>Imóveis</h1>
      <p style={{ opacity: 0.7, marginTop: 6 }}>
        (Por enquanto) Mostrando cadastros feitos, para você ver tudo salvo.
      </p>
      <div style={{ marginTop: 16 }}>
        <TenantsList />
      </div>
    </main>
  );
}

import { TenantPasswordForm } from "./tenant-password-form";

export default function Page() {
  return (
    <main style={{ maxWidth: 600, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 24, fontWeight: 800 }}>Área do inquilino</h1>
      <p style={{ opacity: 0.7, marginTop: 6 }}>
        Aqui você pode alterar sua senha.
      </p>
      <div style={{ marginTop: 16 }}>
        <TenantPasswordForm />
      </div>
    </main>
  );
}

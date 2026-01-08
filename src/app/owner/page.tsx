import Link from "next/link";

export default function Page() {
  return (
    <main style={{ maxWidth: 900, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 24, fontWeight: 800 }}>Painel</h1>
      <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
        <Link href="/owner/tenants">Inquilinos</Link>
        <Link href="/owner/imoveis">Imóveis</Link>
      </div>
    </main>
  );
}

import { PayButton } from "@/components/PayButton";

export default function Page() {
  return (
    <main style={{ maxWidth: 520, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 24, fontWeight: 800 }}>Premium</h1>
      <p style={{ opacity: 0.7 }}>
        Assine para liberar o modo proprietário.
      </p>

      <div style={{ marginTop: 16 }}>
        <PayButton label="Pagar agora" />
      </div>

      <div style={{ marginTop: 12 }}>
        <a href="/api/pay/owner/start" style={{ fontSize: 14 }}>
          Teste (abrir via GET)
        </a>
      </div>
    </main>
  );
}

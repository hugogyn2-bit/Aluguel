export default function OwnerDashboard() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-black/30 backdrop-blur-xl p-6 shadow-[0_0_80px_rgba(0,255,255,0.06)]">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <p className="text-white/60 mt-1">
          Bem vindo ao painel neon do Owner 😈⚡
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card title="Tenants ativos" value="—" />
        <Card title="Pagamentos" value="—" />
        <Card title="Status Premium" value="—" />
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/30 backdrop-blur-xl p-6">
        <h3 className="text-lg font-semibold">Atalhos</h3>
        <div className="mt-4 grid md:grid-cols-2 gap-3">
          <Shortcut text="Cadastrar novo tenant" href="/owner/tenants/create" />
          <Shortcut text="Ver lista de tenants" href="/owner/tenants/list" />
          <Shortcut text="Ver plano Premium" href="/owner/pay" />
          <Shortcut text="Configurações" href="/owner/settings" />
        </div>
      </div>
    </div>
  );
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 transition">
      <p className="text-sm text-white/60">{title}</p>
      <p className="text-3xl font-black mt-2">{value}</p>
    </div>
  );
}

function Shortcut({ text, href }: { text: string; href: string }) {
  return (
    <a
      href={href}
      className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80 hover:bg-white/10 transition"
    >
      {text}
    </a>
  );
}

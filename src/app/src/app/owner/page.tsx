import Link from "next/link";
import { Building2, Wallet, BarChart3, Headphones } from "lucide-react";

function CardLink({
  href,
  icon,
  title,
  subtitle,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 rounded-2xl bg-white/5 p-5 transition hover:bg-white/10 active:scale-[0.98]"
    >
      <div className="h-12 w-12 rounded-xl bg-indigo-600/20 grid place-items-center text-indigo-400">
        {icon}
      </div>
      <div>
        <h2 className="font-bold">{title}</h2>
        <p className="text-sm text-white/70">{subtitle}</p>
      </div>
    </Link>
  );
}

export default function OwnerDashboard() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-10 space-y-4">
      <CardLink
        href="/owner/properties"
        icon={<Building2 />}
        title="Imóveis"
        subtitle="Cadastre e edite"
      />

      <CardLink
        href="/owner/rentals"
        icon={<Wallet />}
        title="Aluguéis"
        subtitle="Cobranças e status"
      />

      <CardLink
        href="/owner/reports"
        icon={<BarChart3 />}
        title="Relatórios"
        subtitle="Receitas e métricas"
      />

      <CardLink
        href="/owner/support"
        icon={<Headphones />}
        title="Suporte"
        subtitle="Atendimento premium"
      />
    </main>
  );
}

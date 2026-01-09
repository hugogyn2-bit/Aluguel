import { Logo } from "@/components/Logo";
import { RoleCard } from "@/components/RoleCard";
import { Building2, KeyRound, ShieldCheck } from "lucide-react";

export default function Page() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <div className="flex items-start justify-between gap-6">
        <Logo />
        <div className="text-xs text-muted mt-2">Sessão segura via NextAuth.</div>
      </div>

      <section className="mt-10">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
          Acesse sua área com segurança
        </h1>
        <p className="text-muted mt-3 leading-relaxed">
          Escolha o perfil para entrar. Proprietário é uma área premium e só libera após ativação.
        </p>

        <div className="mt-8 grid gap-4">
          <RoleCard
            title="Inquilino"
            subtitle="Boletos, contrato, chamados e avisos do imóvel."
            href="/auth/sign-in?role=TENANT"
            Icon={KeyRound}
            glow="secondary"
          />
          <RoleCard
            title="Proprietário"
            subtitle="Gerencie imóveis, aluguéis e relatórios (premium)."
            href="/auth/sign-in?role=OWNER"
            Icon={Building2}
            glow="accent"
          />
        </div>

        <div className="mt-8 flex items-start gap-3 rounded-3xl border border-white/10 bg-surface/75 p-5">
          <ShieldCheck className="h-5 w-5 text-secondary mt-0.5" />
          <p className="text-sm text-muted leading-relaxed">
            Sessão segura via NextAuth.
          </p>
        </div>
      </section>
    </main>
  );
}

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Button } from "@/components/Button";
import { LogOut, Building2, Wallet, BarChart3, Headset } from "lucide-react";

export default async function Page() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email ?? "Proprietário";

  return (
    <main className="mx-auto max-w-4xl px-5 py-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-2xl font-black tracking-tight">Painel do Proprietário</div>
          <div className="text-sm text-muted mt-1">Olá, {email}</div>
        </div>

        <form action="/api/signout" method="post">
          <Button variant="outline" type="submit">
            <LogOut className="h-4 w-4" /> Sair
          </Button>
        </form>
      </div>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Tile title="Imóveis" subtitle="Cadastre e edite" Icon={Building2} />
        <Tile title="Aluguéis" subtitle="Cobranças e status" Icon={Wallet} />
        <Tile title="Relatórios" subtitle="Receitas e métricas" Icon={BarChart3} />
        <Tile title="Suporte" subtitle="Atendimento premium" Icon={Headset} />
      </div>

      <div className="mt-10 text-sm text-muted">
        Este é um dashboard funcional base. Você pode conectar seus módulos reais aqui.
      </div>
    </main>
  );
}

function Tile({ title, subtitle, Icon }: { title: string; subtitle: string; Icon: any }) {
  return (
    <div className="rounded-3xl bg-surface/90 border border-white/10 p-6">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary/85 to-secondary/55 grid place-items-center">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="font-extrabold tracking-tight">{title}</div>
          <div className="text-sm text-muted mt-1">{subtitle}</div>
        </div>
      </div>
    </div>
  );
}

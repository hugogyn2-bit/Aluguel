import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { LogOut, Receipt, FileText, Wrench, Megaphone } from "lucide-react";
import { Button } from "@/components/Button";

export default async function Page() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email ?? "Inquilino";

  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-2xl font-black tracking-tight">Área do Inquilino</div>
          <div className="text-sm text-muted mt-1">Olá, {email}</div>
        </div>

        <form action="/api/signout" method="post">
          <Button variant="outline" type="submit">
            <LogOut className="h-4 w-4" /> Sair
          </Button>
        </form>
      </div>

      <div className="mt-8 grid gap-4">
        <Feature title="Boletos" subtitle="Ver e pagar" Icon={Receipt} />
        <Feature title="Contrato" subtitle="Consultar documentos" Icon={FileText} />
        <Feature title="Chamados" subtitle="Abrir solicitações" Icon={Wrench} />
        <Feature title="Avisos" subtitle="Comunicados do imóvel" Icon={Megaphone} />
      </div>

      <div className="mt-10 text-sm text-muted">
        Quer testar o modo proprietário?{" "}
        <Link className="underline hover:text-text" href="/auth/sign-in?role=OWNER">
          Entrar como Proprietário
        </Link>
      </div>
    </main>
  );
}

function Feature({ title, subtitle, Icon }: { title: string; subtitle: string; Icon: any }) {
  return (
    <div className="rounded-3xl bg-surface/90 border border-white/10 p-6 flex items-center gap-4">
      <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-secondary/85 to-primary/50 grid place-items-center">
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <div className="font-extrabold tracking-tight">{title}</div>
        <div className="text-sm text-muted mt-1">{subtitle}</div>
      </div>
      <div className="text-muted">›</div>
    </div>
  );
}

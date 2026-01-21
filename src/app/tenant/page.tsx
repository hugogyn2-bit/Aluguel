import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";

import { LogOut, Receipt, FileText, Wrench, Megaphone } from "lucide-react";

export default async function TenantPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Área do Inquilino
            </h1>
            <p className="text-white/60 mt-1">
              Bem-vindo, <span className="text-cyan-300">{session.user.email}</span>
            </p>
          </div>

          <Link
            href="/api/auth/signout"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/10"
          >
            <LogOut size={18} />
            Sair
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card
            title="Meus boletos"
            desc="Acesse e acompanhe pagamentos do aluguel."
            icon={<Receipt size={18} />}
            href="#"
          />
          <Card
            title="Documentos"
            desc="Contrato, recibos e arquivos importantes."
            icon={<FileText size={18} />}
            href="#"
          />
          <Card
            title="Manutenção"
            desc="Abra solicitações e acompanhe status."
            icon={<Wrench size={18} />}
            href="#"
          />
          <Card
            title="Avisos"
            desc="Comunicados do proprietário e do imóvel."
            icon={<Megaphone size={18} />}
            href="#"
          />
        </div>

        <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-bold">Status</h2>
          <p className="text-white/60 mt-1">
            Seu acesso como inquilino está ativo ✅
          </p>
        </div>
      </div>
    </div>
  );
}

function Card({
  title,
  desc,
  icon,
  href,
}: {
  title: string;
  desc: string;
  icon: React.ReactNode;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:bg-white/10"
    >
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-500/15 text-cyan-300">
          {icon}
        </div>
        <div>
          <div className="font-bold text-white/90">{title}</div>
          <div className="text-sm text-white/60">{desc}</div>
        </div>
      </div>
    </Link>
  );
}

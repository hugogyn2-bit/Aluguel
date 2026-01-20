import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/sign-in");
  }

  return (
    <main className="min-h-screen px-6 py-10 text-white">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-extrabold tracking-tight">
          ✅ Bem-vindo, {session.user?.email}
        </h1>

        <p className="mt-2 text-white/70">
          Você está logado como <span className="text-cyan-300 font-semibold">OWNER</span>.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <h2 className="text-lg font-bold">🏠 Meus Inquilinos</h2>
            <p className="mt-2 text-sm text-white/60">
              Gerencie seus inquilinos e contratos.
            </p>

            <Link
              href="/owner/tenants"
              className="mt-4 inline-block text-sm font-semibold text-cyan-300 hover:text-cyan-200"
            >
              Acessar →
            </Link>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <h2 className="text-lg font-bold">💳 Assinatura / Pagamento</h2>
            <p className="mt-2 text-sm text-white/60">
              Controle seu plano e pagamentos.
            </p>

            <Link
              href="/pay/owner"
              className="mt-4 inline-block text-sm font-semibold text-cyan-300 hover:text-cyan-200"
            >
              Abrir →
            </Link>
          </div>
        </div>

        <div className="mt-10 text-sm text-white/50">
          Se quiser, eu deixo esse dashboard com um layout premium (sidebar + cards + estatísticas).
        </div>
      </div>
    </main>
  );
}

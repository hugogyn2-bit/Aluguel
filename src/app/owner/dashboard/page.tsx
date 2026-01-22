import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const runtime = "nodejs";

export default async function OwnerDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-white/70">Você precisa estar logado.</div>
      </div>
    );
  }

  const owner = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      ownedTenants: true,
    },
  });

  if (!owner || owner.role !== "OWNER") {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-white/70">Apenas OWNER pode acessar.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <h1 className="text-3xl font-extrabold">📊 Dashboard do Proprietário</h1>
          <p className="mt-2 text-white/70">
            Bem vindo, <span className="text-white">{owner.name ?? owner.email}</span>
          </p>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
              <div className="text-white/60 text-sm">Inquilinos cadastrados</div>
              <div className="text-3xl font-extrabold mt-2">
                {owner.ownedTenants.length}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
              <div className="text-white/60 text-sm">Premium</div>
              <div className="text-xl font-semibold mt-2">
                {owner.ownerPaid || owner.stripeStatus === "active" ? "✅ Ativo" : "❌ Não"}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
              <div className="text-white/60 text-sm">Trial</div>
              <div className="text-xl font-semibold mt-2">
                {owner.trialEndsAt ? "✅ Ativo" : "❌ Não"}
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col md:flex-row gap-3">
            <Link
              href="/owner/tenants"
              className="rounded-xl px-4 py-3 bg-white/10 border border-white/10 hover:bg-white/15"
            >
              👥 Meus Inquilinos
            </Link>

            <Link
              href="/owner/tenants/create"
              className="rounded-xl px-4 py-3 bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-purple-600 font-semibold hover:opacity-95"
            >
              ➕ Novo Inquilino
            </Link>

            <Link
              href="/owner/settings"
              className="rounded-xl px-4 py-3 bg-white/10 border border-white/10 hover:bg-white/15"
            >
              ⚙️ Configurações
            </Link>

            <Link
              href="/owner/premium"
              className="rounded-xl px-4 py-3 bg-white/10 border border-white/10 hover:bg-white/15"
            >
              💳 Premium
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

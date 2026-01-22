import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const runtime = "nodejs";

export default async function OwnerSettingsPage() {
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
      <div className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-3xl font-extrabold">⚙️ Configurações</h1>

          <Link
            href="/owner/dashboard"
            className="rounded-xl px-4 py-2 bg-white/10 border border-white/10 hover:bg-white/15"
          >
            ← Voltar
          </Link>
        </div>

        <div className="mt-6 space-y-4">
          <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
            <div className="text-white/60 text-sm">Seu email</div>
            <div className="text-lg font-semibold">{owner.email}</div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
            <div className="text-white/60 text-sm">Seu nome</div>
            <div className="text-lg font-semibold">{owner.name ?? "Não definido"}</div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
            <div className="text-white/60 text-sm">Premium (interno)</div>
            <div className="text-lg font-semibold">
              {owner.ownerPaid ? "✅ Sim" : "❌ Não"}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
            <div className="text-white/60 text-sm">Stripe Status</div>
            <div className="text-lg font-semibold">{owner.stripeStatus ?? "null"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

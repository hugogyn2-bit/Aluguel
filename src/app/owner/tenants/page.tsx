import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const runtime = "nodejs";

export default async function OwnerTenantsPage() {
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

  const tenants = await prisma.tenantProfile.findMany({
    where: { ownerId: owner.id },
    orderBy: { createdAt: "desc" },
    include: {
      user: true,
    },
  });

  return (
    <div className="min-h-screen bg-black text-white px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-3xl font-extrabold">👥 Meus Inquilinos</h1>

          <div className="flex gap-2">
            <Link
              href="/owner/dashboard"
              className="rounded-xl px-4 py-2 bg-white/10 border border-white/10 hover:bg-white/15"
            >
              ← Voltar
            </Link>

            <Link
              href="/owner/tenants/create"
              className="rounded-xl px-4 py-2 bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-purple-600 font-semibold hover:opacity-95"
            >
              ➕ Novo
            </Link>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          {tenants.length === 0 ? (
            <div className="text-white/70">
              Nenhum inquilino cadastrado ainda.
            </div>
          ) : (
            <div className="space-y-4">
              {tenants.map((t) => (
                <div
                  key={t.id}
                  className="rounded-2xl border border-white/10 bg-black/40 p-5"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div>
                      <div className="text-xl font-bold">{t.fullName}</div>
                      <div className="text-white/60 text-sm">
                        Email: {t.user.email}
                      </div>
                    </div>

                    <div className="text-sm text-white/60">
                      Criado em: {new Date(t.createdAt).toLocaleString()}
                    </div>
                  </div>

                  <div className="mt-3 text-sm text-white/70 grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>📌 CPF: {t.cpf}</div>
                    <div>🪪 RG: {t.rg}</div>
                    <div>🏠 Endereço: {t.address}</div>
                    <div>📮 CEP: {t.cep}</div>
                  </div>

                  <div className="mt-3 text-xs text-white/50">
                    Must Change Password:{" "}
                    {t.user.mustChangePassword ? "✅ Sim" : "❌ Não"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

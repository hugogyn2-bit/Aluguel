"use client";

export default function TenantHomePage() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
      <h2 className="text-2xl font-extrabold">Bem-vindo 👋</h2>
      <p className="mt-2 text-white/70">
        Aqui você pode acessar apenas seus dados e seu contrato de locação.
      </p>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        <a
          href="/tenant/me"
          className="rounded-xl px-4 py-4 bg-white/10 border border-white/10 hover:bg-white/15"
        >
          <div className="text-lg font-bold">👤 Meus dados</div>
          <div className="text-sm text-white/60">
            Veja seus dados cadastrados pelo proprietário.
          </div>
        </a>

        <a
          href="/tenant/contract"
          className="rounded-xl px-4 py-4 bg-white/10 border border-white/10 hover:bg-white/15"
        >
          <div className="text-lg font-bold">📄 Contrato</div>
          <div className="text-sm text-white/60">
            Ver e assinar o contrato digitalmente.
          </div>
        </a>
      </div>
    </div>
  );
}

"use client";

import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

export default function TenantLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  function NavLink({
    href,
    label,
    icon,
  }: {
    href: string;
    label: string;
    icon: string;
  }) {
    const active = pathname === href;

    return (
      <a
        href={href}
        className={`flex items-center gap-2 rounded-xl px-4 py-3 border transition ${
          active
            ? "bg-white/15 border-white/20"
            : "bg-white/5 border-white/10 hover:bg-white/10"
        }`}
      >
        <span>{icon}</span>
        <span className="font-semibold">{label}</span>
      </a>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* topo */}
      <div className="border-b border-white/10 bg-white/5">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-extrabold">🏠 Área do Inquilino</h1>
            <p className="text-xs text-white/60">Acesso somente aos seus dados</p>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: "/auth/sign-in" })}
            className="rounded-xl px-4 py-2 bg-white/10 border border-white/10 hover:bg-white/15 text-sm"
          >
            Sair
          </button>
        </div>
      </div>

      {/* conteúdo */}
      <div className="mx-auto max-w-6xl px-4 py-6 grid gap-6 md:grid-cols-[260px_1fr]">
        {/* menu lateral */}
        <aside className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3 h-fit">
          <NavLink href="/tenant" label="Início" icon="🏠" />
          <NavLink href="/tenant/me" label="Meus dados" icon="👤" />
          <NavLink href="/tenant/contract" label="Contrato" icon="📄" />
        </aside>

        {/* páginas */}
        <main>{children}</main>
      </div>
    </div>
  );
}

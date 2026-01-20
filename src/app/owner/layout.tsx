import type { ReactNode } from "react";
import Link from "next/link";

export default function OwnerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#05060a] text-white overflow-hidden">
      {/* Background neon */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(0,255,255,0.12),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(255,0,255,0.10),transparent_65%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,120,255,0.10),transparent_65%)]" />

        {/* Flash lines */}
        <div className="absolute -top-24 left-0 right-0 h-[2px] bg-cyan-400/30 blur-md animate-pulse" />
        <div className="absolute top-1/3 left-0 right-0 h-[1px] bg-fuchsia-400/25 blur-md animate-pulse" />
        <div className="absolute bottom-24 left-0 right-0 h-[2px] bg-blue-400/20 blur-md animate-pulse" />
      </div>

      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-[280px] hidden md:flex flex-col border-r border-white/10 bg-black/30 backdrop-blur-xl">
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              {/* Logo */}
              <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-cyan-400/30 to-fuchsia-500/20 border border-white/10 shadow-[0_0_40px_rgba(0,255,255,0.15)] flex items-center justify-center">
                <span className="font-black text-lg text-white">A</span>
              </div>

              <div className="leading-tight">
                <p className="font-bold text-white text-lg">Aluguel</p>
                <p className="text-xs text-white/50">Painel do Owner</p>
              </div>
            </div>
          </div>

          <nav className="p-4 flex-1 space-y-2">
            <NavItem href="/owner">Dashboard</NavItem>
            <NavItem href="/owner/tenants">Meus Inquilinos</NavItem>
            <NavItem href="/owner/trial">Trial / Premium</NavItem>
            <NavItem href="/owner/settings">Configurações</NavItem>
          </nav>

          <div className="p-4 border-t border-white/10">
            <Link
              href="/auth/sign-in"
              className="block w-full text-center rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-3 text-sm transition"
            >
              Sair
            </Link>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1">
          {/* Topbar */}
          <header className="sticky top-0 z-20 border-b border-white/10 bg-black/20 backdrop-blur-xl">
            <div className="px-4 md:px-8 py-4 flex items-center justify-between">
              <div>
                <h1 className="text-lg md:text-xl font-bold tracking-tight">
                  Owner Panel ⚡
                </h1>
                <p className="text-xs md:text-sm text-white/50">
                  Controle seus tenants, pagamentos e imóveis com estilo neon.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/owner/tenants/create"
                  className="rounded-xl px-4 py-2 text-sm bg-cyan-500/20 border border-cyan-400/30 hover:bg-cyan-500/30 transition shadow-[0_0_35px_rgba(0,255,255,0.12)]"
                >
                  + Novo Tenant
                </Link>

                <Link
                  href="/owner/pay"
                  className="rounded-xl px-4 py-2 text-sm bg-fuchsia-500/15 border border-fuchsia-400/30 hover:bg-fuchsia-500/25 transition shadow-[0_0_35px_rgba(255,0,255,0.10)]"
                >
                  Premium
                </Link>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="px-4 md:px-8 py-6">{children}</div>
        </main>
      </div>
    </div>
  );
}

function NavItem({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="block rounded-xl px-4 py-3 text-sm text-white/70 border border-white/10 bg-white/5 hover:bg-white/10 hover:text-white transition"
    >
      {children}
    </Link>
  );
}

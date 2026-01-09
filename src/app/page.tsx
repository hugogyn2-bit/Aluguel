import { Logo } from "@/components/Logo";

export default function Page() {
  return (
    <main className="mx-auto max-w-md px-5 py-10">
      <div className="flex items-start justify-between gap-6">
        <Logo />
        <div className="text-xs text-muted mt-2"></div>
      </div>

      <section className="mt-10">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Login</h1>
        <p className="text-muted mt-3 leading-relaxed">
          Entre com seu e-mail e senha. O proprietário cria o acesso do inquilino e pode redefinir a senha do inquilino quando necessário.
        </p>

      </section>
    </main>
  );
}
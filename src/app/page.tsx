import { Logo } from "@/components/Logo";

export default function Page() {
  return (
    <main className="mx-auto max-w-md px-5 py-10">
      <div className="flex items-start justify-between gap-6">
        <Logo />
      </div>

      <section className="mt-10">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Login</h1>
        <p className="text-muted mt-3 leading-relaxed">
          Entre com seu e-mail e senha. O proprietário cria o acesso do inquilino e pode redefinir a senha do inquilino quando necessário.
        </p>

        <div className="mt-8 grid gap-3">
          <a
            href="/auth/sign-in"
            className="rounded-2xl bg-accent text-black font-bold px-4 py-3 text-center"
          >
            Entrar
          </a>

          <a
            href="/auth/sign-up"
            className="rounded-2xl border border-white/10 bg-surface/80 px-4 py-3 text-center"
          >
            Criar conta
          </a>

          <a
            href="/auth/forgot-password"
            className="rounded-2xl border border-white/10 bg-surface/60 px-4 py-3 text-center"
          >
            Esqueci minha senha
          </a>
        </div>
      </section>
    </main>
  );
}

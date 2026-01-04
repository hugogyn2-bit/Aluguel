import { signInAction } from "../actions";
import { redirect } from "next/navigation";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const sp = await searchParams;
  const role = sp?.role === "OWNER" ? "OWNER" : "TENANT";

  async function action(fd: FormData): Promise<void> {
    "use server";
    fd.set("role", role);

    const res = await signInAction(fd);

    if (res?.ok && res?.redirectTo) {
      redirect(res.redirectTo);
    }

    // se falhar, NÃO retorna objeto (pra não dar problema de typing)
    // apenas deixa a página recarregar (ou depois a gente mostra mensagem)
  }

  return (
    <main style={{ maxWidth: 420, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>Entrar</h1>
      <p style={{ opacity: 0.7, marginTop: 8 }}>Acesse sua conta para continuar.</p>

      <form action={action} style={{ display: "grid", gap: 12, marginTop: 16 }}>
        <input name="email" type="email" placeholder="Email" required />
        <input name="password" type="password" placeholder="Senha" required />
        <button type="submit">Entrar</button>
      </form>

      <p style={{ marginTop: 16, fontSize: 14, opacity: 0.7 }}>
        Não tem conta? <a href={`/auth/sign-up?role=${role}`}>Criar conta</a>
      </p>
    </main>
  );
}

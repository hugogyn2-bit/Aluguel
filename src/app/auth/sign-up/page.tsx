import { signUpAction } from "../actions";
import { redirect } from "next/navigation";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const sp = await searchParams;
  const role = sp?.role === "OWNER" ? "OWNER" : "TENANT";

  async function action(fd: FormData) {
    "use server";
    fd.set("role", role);
    const res = await signUpAction(fd);

    // se sua action retorna redirectTo, já redireciona aqui
    if (res?.ok && res?.redirectTo) redirect(res.redirectTo);

    return res;
  }

  return (
    <main style={{ maxWidth: 420, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>Criar conta</h1>
      <p style={{ opacity: 0.7, marginTop: 8 }}>Cadastre-se para continuar.</p>

      <form action={action} style={{ display: "grid", gap: 12, marginTop: 16 }}>
        <input name="name" placeholder="Nome (opcional)" />
        <input name="email" type="email" placeholder="Email" required />
        <input name="password" type="password" placeholder="Senha" minLength={6} required />

        <button type="submit">Criar conta</button>
      </form>

      <p style={{ marginTop: 16, fontSize: 14, opacity: 0.7 }}>
        Já tem conta? <a href={`/auth/sign-in?role=${role}`}>Entrar</a>
      </p>
    </main>
  );
}

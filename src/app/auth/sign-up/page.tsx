import { AuthShell } from "../_ui";
import { signUpAction } from "../actions";
import { redirect } from "next/navigation";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const sp = await searchParams;
  const role = (sp.role === "OWNER" ? "OWNER" : "TENANT") as "OWNER" | "TENANT";

  async function action(fd: FormData) {
    "use server";
    fd.set("role", role);
    const res = await signUpAction(fd);
    if (res?.ok && res?.redirectTo) redirect(res.redirectTo);
    return res;
  }

  return (
    <AuthShell title="Criar conta" subtitle="Cadastre-se para continuar.">
      <form action={action} className="grid gap-3">
        <input name="email" placeholder="E-mail" required />
        <input name="password" type="password" placeholder="Senha" minLength={6} required />
        <input name="name" placeholder="Nome (opcional)" />
        <button type="submit">Criar conta</button>
      </form>
    </AuthShell>
  );
}

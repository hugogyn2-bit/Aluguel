import { AuthShell } from "../_ui";
import { signInAction } from "../actions";
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
    const res = await signInAction(fd);

    if (res?.ok && res?.redirectTo) redirect(res.redirectTo);
    return;
  }

  return (
    <AuthShell title="Entrar" subtitle="Acesse sua conta para continuar.">
      <form action={action} className="grid gap-3">
        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          className="border rounded p-2"
        />
        <input
          name="password"
          type="password"
          placeholder="Senha"
          required
          className="border rounded p-2"
        />

        <button type="submit" className="rounded bg-black text-white p-2">
          Entrar
        </button>

        <a className="text-sm underline" href={`/auth/sign-up?role=${role}`}>
          Criar conta
        </a>
      </form>
    </AuthShell>
  );
}

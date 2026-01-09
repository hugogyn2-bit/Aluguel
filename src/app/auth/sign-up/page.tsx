import { AuthShell } from "../_ui";
import { signUpAction } from "../actions";
import { redirect } from "next/navigation";

export default function Page() {
  // ✅ Cadastro público: somente OWNER
  const role = "OWNER" as const;

  async function action(fd: FormData) {
    "use server";
    fd.set("role", role);
    const res = await signUpAction(fd);

    if (res?.ok && res?.redirectTo) redirect(res.redirectTo);
    return;
  }

  return (
    <AuthShell title="Criar conta" subtitle="Cadastre-se para continuar.">
      <form action={action} className="grid gap-3">
        <input
          name="name"
          placeholder="Nome (opcional)"
          className="border rounded p-2"
        />
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
          minLength={6}
          required
          className="border rounded p-2"
        />

        <input
          name="birthDate"
          placeholder="Data de nascimento (dd/mm/aaaa)"
          required
          className="border rounded p-2"
        />

        <button type="submit" className="rounded bg-black text-white p-2">
          Criar conta
        </button>

        <a className="text-sm underline" href={`/auth/sign-in`}>
          Entrar
        </a>
      </form>
    </AuthShell>
  );
}

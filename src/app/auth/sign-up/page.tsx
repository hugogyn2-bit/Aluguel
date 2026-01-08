import { AuthShell } from "../_ui";
import { signUpAction } from "../actions";
import { redirect } from "next/navigation";

export default function Page() {
  async function action(fd: FormData) {
    "use server";
    const res = await signUpAction(fd);
    if (res?.ok) redirect("/auth/sign-in");
    // se falhar, volta com msg simples
    redirect("/auth/sign-up?error=1");
  }

  return (
    <AuthShell title="Criar conta (Proprietário)" subtitle="Crie sua conta de proprietário para começar.">
      <form action={action} className="grid gap-3 mt-4">
        <input name="name" placeholder="Nome (opcional)" className="border rounded p-2" />
        <input name="email" type="email" placeholder="Email" required className="border rounded p-2" />
        <input name="password" type="password" placeholder="Senha" minLength={6} required className="border rounded p-2" />
        <button type="submit" className="rounded bg-black text-white p-2">
          Criar conta
        </button>
        <a className="text-sm underline" href="/auth/sign-in">
          Já tenho conta
        </a>
      </form>
    </AuthShell>
  );
}

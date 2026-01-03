import { AuthShell } from "../_ui";
import { signUpAction } from "../actions";

export default async function Page({ searchParams }: { searchParams: Promise<{ role?: string }> }) {
  const sp = await searchParams;
  const role = (sp.role === "OWNER" ? "OWNER" : "TENANT") as "OWNER" | "TENANT";

  return (
    <AuthShell
      title="Criar conta"
      subtitle="Cadastre-se para continuar."
      role={role}
      mode="sign-up"
      action={async (fd) => {
        "use server";
        fd.set("role", role);
        return await signUpAction(fd);
      }}
    />
  );
}

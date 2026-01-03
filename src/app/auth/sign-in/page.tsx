import { AuthShell } from "../_ui";
import { headers } from "next/headers";

export default async function Page({ searchParams }: { searchParams: Promise<{ role?: string }> }) {
  const sp = await searchParams;
  const role = (sp.role === "OWNER" ? "OWNER" : "TENANT") as "OWNER" | "TENANT";

  return (
    <AuthShell
      title="Entrar"
      subtitle="Acesse sua conta com segurança."
      role={role}
      mode="sign-in"
      action={async () => {
        // login is handled via next-auth in client button; keep simple
        return { ok: true };
      }}
    />
  );
}

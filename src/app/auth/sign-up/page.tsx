import { signUpAction } from "../actions";
import { AuthShell } from "../_ui";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const sp = await searchParams;
  const role = sp.role === "OWNER" ? "OWNER" : "TENANT";

  async function action(fd: FormData) {
    "use server";
    fd.set("role", role);
    return await signUpAction(fd);
  }

  return (
    <AuthShell
      title="Criar conta"
      subtitle="Cadastre-se para continuar."
    >
      <form action={action} className="space-y-4">
        <input name="name" placeholder="Nome" />
        <input name="email" typ

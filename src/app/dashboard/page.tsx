import { redirect } from "next/navigation";

export default function Page() {
  // middleware já redireciona; aqui é fallback
  redirect("/auth/sign-in");
}

import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-20">
      <h1 className="text-2xl font-black">Página não encontrada</h1>
      <p className="text-muted mt-2">Volte para a home e tente novamente.</p>
      <Link className="inline-block mt-6 underline" href="/">Ir para Home</Link>
    </main>
  );
}

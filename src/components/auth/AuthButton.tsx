import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  loading?: boolean;
  disabled?: boolean;
  loadingText?: string;
  type?: "button" | "submit";
};

function SpinnerNeon({ text }: { text: string }) {
  return (
    <div className="inline-flex items-center gap-2">
      <span className="relative flex h-4 w-4">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-35" />
        <span className="relative inline-flex h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-cyan-300" />
      </span>
      <span>{text}</span>
    </div>
  );
}

export default function AuthButton({
  children,
  loading = false,
  disabled = false,
  loadingText = "Carregando...",
  type = "submit",
}: Props) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className="group relative w-full overflow-hidden rounded-xl px-4 py-3 font-semibold text-white transition disabled:opacity-60"
    >
      {/* glow atrás */}
      <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-purple-600 opacity-95" />
      <span className="absolute -inset-1 rounded-xl blur-xl bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-purple-600 opacity-40 group-hover:opacity-60 transition" />

      {/* brilho passando */}
      <span className="absolute inset-0 opacity-0 group-hover:opacity-40 transition">
        <span className="absolute -left-[60%] top-0 h-full w-[50%] rotate-12 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-auth-sweep" />
      </span>

      {/* borda */}
      <span className="absolute inset-0 rounded-xl ring-1 ring-white/15 group-hover:ring-white/25 transition" />

      <span className="relative z-10">
        {loading ? <SpinnerNeon text={loadingText} /> : children}
      </span>
    </button>
  );
}

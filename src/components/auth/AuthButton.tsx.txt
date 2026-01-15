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
      className="relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-purple-600 px-4 py-3 font-semibold text-white transition hover:opacity-95 disabled:opacity-60"
    >
      <span className="relative z-10">
        {loading ? <SpinnerNeon text={loadingText} /> : children}
      </span>
      <span className="absolute inset-0 opacity-30 blur-xl bg-white" />
    </button>
  );
}

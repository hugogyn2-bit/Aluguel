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

      ✅ {/* ISSO AQUI PRECISA */}
      <span className="pointer-events-none absolute inset-0 opacity-30 blur-xl bg-white" />
    </button>
  );
}

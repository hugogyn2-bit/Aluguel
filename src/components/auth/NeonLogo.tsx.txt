export default function NeonLogo() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <div className="absolute inset-0 rounded-2xl blur-xl opacity-70 bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-purple-600" />
        <div className="relative h-12 w-12 rounded-2xl bg-black/60 border border-white/10 grid place-items-center shadow-[0_0_30px_rgba(34,211,238,0.25)]">
          <span className="text-xl font-black bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-purple-300 bg-clip-text text-transparent">
            A
          </span>
        </div>
      </div>

      <div className="leading-tight">
        <div className="text-xl font-extrabold tracking-tight">
          <span className="bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-purple-400 bg-clip-text text-transparent">
            Aluguel
          </span>
        </div>
        <div className="text-xs text-white/60 -mt-0.5">Neon Access Portal</div>
      </div>
    </div>
  );
}

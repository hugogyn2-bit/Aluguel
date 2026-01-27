{owner.isPremium ? (
  <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-purple-500 px-4 py-1 text-sm font-bold text-black">
    💎 Premium ativo
  </div>
) : (
  <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-sm text-white/70">
    🔒 Conta gratuita
  </div>
)}

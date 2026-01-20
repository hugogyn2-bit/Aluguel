"use client";

import { useMemo } from "react";

export default function NeonLogo() {
  const sparks = useMemo(() => {
    return Array.from({ length: 10 }).map((_, i) => ({
      id: i,
      top: Math.random() * 100,
      left: Math.random() * 100,
      size: 2 + Math.random() * 4,
      delay: Math.random() * 2,
      duration: 1.5 + Math.random() * 2.5,
      opacity: 0.25 + Math.random() * 0.5,
    }));
  }, []);

  return (
    <div className="flex items-center gap-3 select-none">
      {/* ÍCONE */}
      <div className="relative">
        {/* Aura principal */}
        <div className="absolute inset-0 rounded-2xl blur-2xl opacity-70 neon-pulse bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-purple-600" />

        {/* Partículas */}
        <div className="absolute inset-0">
          {sparks.map((s) => (
            <span
              key={s.id}
              className="absolute rounded-full bg-white/40 blur-[0.5px] neon-spark"
              style={{
                top: `${s.top}%`,
                left: `${s.left}%`,
                width: `${s.size}px`,
                height: `${s.size}px`,
                opacity: s.opacity,
                animationDelay: `${s.delay}s`,
                animationDuration: `${s.duration}s`,
              }}
            />
          ))}
        </div>

        {/* Caixa */}
        <div className="relative h-12 w-12 rounded-2xl bg-black/60 border border-white/10 grid place-items-center shadow-[0_0_55px_rgba(34,211,238,0.45)] overflow-hidden">
          {/* Flash passando */}
          <div className="absolute inset-0 neon-shine" />

          {/* Borda neon viva */}
          <div className="absolute inset-0 rounded-2xl neon-border" />

          <span className="relative z-10 text-xl font-black bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-purple-300 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(34,211,238,0.35)]">
            A
          </span>
        </div>
      </div>

      {/* TEXTO */}
      <div className="leading-tight">
        <div className="text-xl font-extrabold tracking-tight">
          <span className="bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-purple-400 bg-clip-text text-transparent drop-shadow-[0_0_14px_rgba(34,211,238,0.35)]">
            Aluguel
          </span>
        </div>
        <div className="text-xs text-white/60 -mt-0.5">
          Neon Access Portal
        </div>
      </div>
    </div>
  );
}

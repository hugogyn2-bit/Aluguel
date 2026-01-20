"use client";

import { useMemo } from "react";

export default function AuthBackground() {
  const particles = useMemo(() => {
    return Array.from({ length: 28 }).map((_, i) => ({
      id: i,
      top: Math.random() * 100,
      left: Math.random() * 100,
      size: 2 + Math.random() * 5,
      duration: 6 + Math.random() * 10,
      delay: Math.random() * 4,
      opacity: 0.08 + Math.random() * 0.22,
    }));
  }, []);

  return (
    <>
      {/* base */}
      <div className="absolute inset-0 bg-black" />

      {/* glows */}
      <div className="absolute inset-0">
        <div className="absolute -top-48 -left-48 h-[620px] w-[620px] rounded-full bg-fuchsia-500/30 blur-3xl" />
        <div className="absolute -bottom-48 -right-48 h-[620px] w-[620px] rounded-full bg-cyan-500/25 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-[720px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/15 blur-3xl" />
      </div>

      {/* grid sutil */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.07] auth-grid" />

      {/* partículas */}
      <div className="pointer-events-none absolute inset-0">
        {particles.map((p) => (
          <span
            key={p.id}
            className="absolute rounded-full bg-white blur-[0.5px]"
            style={{
              top: `${p.top}%`,
              left: `${p.left}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              opacity: p.opacity,
              animation: `floaty ${p.duration}s ease-in-out ${p.delay}s infinite`,
            }}
          />
        ))}
      </div>

      {/* flashes / sweeps */}
      <div className="pointer-events-none absolute inset-0">
        <div className="neon-sweep neon-sweep-1" />
        <div className="neon-sweep neon-sweep-2" />
        <div className="neon-sweep neon-sweep-3" />
        <div className="neon-sweep neon-sweep-4" />
      </div>

      {/* vignette */}
      <div className="pointer-events-none absolute inset-0 auth-vignette" />
    </>
  );
}

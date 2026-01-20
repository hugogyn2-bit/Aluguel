"use client";

import { useMemo } from "react";

export default function AuthBackground() {
  const particles = useMemo(() => {
    return Array.from({ length: 28 }).map((_, i) => ({
      id: i,
      top: Math.random() * 100,
      left: Math.random() * 100,
      size: 2 + Math.random() * 5,
      duration: 5 + Math.random() * 10,
      delay: Math.random() * 5,
      opacity: 0.15 + Math.random() * 0.6,
    }));
  }, []);

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      {/* Glow blobs */}
      <div className="absolute -top-52 -left-52 h-[650px] w-[650px] rounded-full bg-fuchsia-500/25 blur-3xl" />
      <div className="absolute -bottom-52 -right-52 h-[650px] w-[650px] rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="absolute left-1/2 top-1/2 h-[750px] w-[750px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/10 blur-3xl" />

      {/* Grid hacker */}
      <div className="absolute inset-0 opacity-[0.16] bg-[linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:54px_54px] neon-grid" />

      {/* Scanlines (efeito monitor) */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.10] bg-[linear-gradient(to_bottom,rgba(255,255,255,0.10)_1px,transparent_2px)] bg-[size:100%_4px]" />

      {/* Partículas flutuantes */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((p) => (
          <span
            key={p.id}
            className="absolute rounded-full bg-white blur-[0.6px]"
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

      {/* Flashes neon passando */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="neon-sweep neon-sweep-1" />
        <div className="neon-sweep neon-sweep-2" />
        <div className="neon-sweep neon-sweep-3" />
      </div>

      {/* Vinheta dark */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.65)_65%,rgba(0,0,0,0.92)_100%)]" />
    </div>
  );
}

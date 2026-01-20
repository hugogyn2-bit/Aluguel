"use client";

import React from "react";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export default function AuthInput({ label, className = "", ...props }: Props) {
  return (
    <div className="space-y-2">
      <label className="text-sm text-white/70">{label}</label>

      <input
        {...props}
        className={[
          "w-full rounded-xl px-4 py-3",
          "bg-white/5 border border-white/10",
          "text-white placeholder:text-white/30",
          "outline-none",
          "focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20",
          "transition",
          // ✅ deixa o date bonito no dark
          "color-scheme-dark",
          className,
        ].join(" ")}
      />
    </div>
  );
}

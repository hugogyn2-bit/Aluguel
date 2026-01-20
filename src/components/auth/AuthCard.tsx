import type { ReactNode } from "react";
import NeonLogo from "@/components/auth/NeonLogo";

type Props = {
  title: string;
  subtitle?: string;
  badgeTitle?: string;
  badgeSubtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
};

export default function AuthCard({
  title,
  subtitle,
  badgeTitle,
  badgeSubtitle,
  children,
  footer,
}: Props) {
  return (
    <div className="relative w-full max-w-md">
      {/* Glow + border pulse */}
      <div className="pointer-events-none absolute -inset-[1px] rounded-[22px] bg-gradient-to-r from-cyan-500/70 via-fuchsia-500/60 to-purple-500/70 opacity-60 blur-md animate-pulse" />

      <div className="relative w-full rounded-[22px] border border-white/10 bg-black/40 p-6 shadow-[0_0_90px_rgba(0,255,255,0.12)] backdrop-blur-2xl overflow-hidden">
        {/* brilho passando */}
        <div className="pointer-events-none absolute inset-0 opacity-35">
          <div className="absolute -left-[40%] top-0 h-full w-[60%] rotate-12 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-auth-sweep" />
        </div>

        <div className="mb-6 flex items-center justify-between gap-3">
          <NeonLogo />
          <div className="text-xs text-white/50 text-right">
            {badgeTitle ? (
              <div className="font-semibold text-white/80">{badgeTitle}</div>
            ) : null}
            {badgeSubtitle ? <div className="text-white/50">{badgeSubtitle}</div> : null}
          </div>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-extrabold tracking-tight text-white">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-1 text-sm text-white/70">{subtitle}</p>
          ) : null}
        </div>

        {children}

        {footer ? <div className="mt-6">{footer}</div> : null}

        {/* borda interna mais suave */}
        <div className="pointer-events-none absolute inset-0 rounded-[22px] ring-1 ring-white/10" />
      </div>
    </div>
  );
}

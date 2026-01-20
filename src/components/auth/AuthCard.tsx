import type { ReactNode } from "react";
import NeonLogo from "@/components/auth/NeonLogo";

type Props = {
  title: string;
  subtitle?: ReactNode;
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
    <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_0_60px_rgba(0,255,255,0.10)] backdrop-blur-xl">
      <div className="mb-6 flex items-center justify-between gap-3">
        <NeonLogo />
        <div className="text-xs text-white/50 text-right">
          {badgeTitle ? (
            <div className="font-semibold text-white/70">{badgeTitle}</div>
          ) : null}
          {badgeSubtitle ? <div>{badgeSubtitle}</div> : null}
        </div>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
        {subtitle ? <div className="mt-1 text-sm text-white/70">{subtitle}</div> : null}
      </div>

      {children}

      {footer ? <div className="mt-6">{footer}</div> : null}
    </div>
  );
}

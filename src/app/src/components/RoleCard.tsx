import Link from "next/link";
import { cn } from "@/lib/cn";
import type { LucideIcon } from "lucide-react";

export function RoleCard({
  title,
  subtitle,
  href,
  Icon,
  glow,
}: {
  title: string;
  subtitle: string;
  href: string;
  Icon: LucideIcon;
  glow: "secondary" | "accent";
}) {
  const ring = glow === "secondary" ? "ring-secondary/25 shadow-[0_20px_60px_rgba(6,182,212,0.18)]" : "ring-accent/25 shadow-[0_20px_60px_rgba(249,115,22,0.18)]";
  const badge = glow === "secondary" ? "from-secondary/95 to-secondary/35" : "from-accent/95 to-accent/35";

  return (
    <Link
      href={href}
      className={cn(
        "group block rounded-3xl bg-surface/95 border border-white/10 p-6 ring-1 transition hover:-translate-y-0.5",
        ring
      )}
    >
      <div className="flex items-center gap-4">
        <div className={cn("h-14 w-14 rounded-2xl bg-gradient-to-br grid place-items-center", badge)}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="text-base font-extrabold tracking-tight">{title}</div>
          <div className="text-sm text-muted leading-snug mt-1">{subtitle}</div>
        </div>
        <div className="text-muted group-hover:text-text transition">›</div>
      </div>
    </Link>
  );
}

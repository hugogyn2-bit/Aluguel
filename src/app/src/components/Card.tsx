import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-3xl bg-surface/90 border border-white/10 shadow-glow backdrop-blur-xl",
        className
      )}
    >
      {children}
    </div>
  );
}

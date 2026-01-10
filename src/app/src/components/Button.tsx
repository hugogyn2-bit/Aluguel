import * as React from "react";
import { cn } from "@/lib/cn";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline" | "ghost";
  loading?: boolean;
};

export function Button({ className, variant = "primary", loading, disabled, children, ...props }: Props) {
  const styles =
    variant === "primary"
      ? "bg-primary hover:bg-primary/90 text-white"
      : variant === "outline"
        ? "border border-white/15 hover:border-white/25 bg-transparent"
        : "bg-transparent hover:bg-white/5";

  return (
    <button
      className={cn(
        "h-12 px-5 rounded-2xl font-bold inline-flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed",
        styles,
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-transparent animate-spin" /> : null}
      {children}
    </button>
  );
}

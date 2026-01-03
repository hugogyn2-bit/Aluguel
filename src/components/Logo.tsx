import { Home } from "lucide-react";

export function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-primary/90 to-secondary/60 shadow-glow grid place-items-center">
        <Home className="h-5 w-5" />
      </div>
      <div>
        <div className="text-lg font-black tracking-tight">Aluga</div>
        <div className="text-xs text-muted -mt-0.5">Inquilino & Proprietário</div>
      </div>
    </div>
  );
}

import type { ReactNode } from "react";
import AuthBackground from "@/components/auth/AuthBackground";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 bg-black text-white overflow-hidden">
      {/* ✅ background não pega clique */}
      <div className="pointer-events-none absolute inset-0">
        <AuthBackground />
      </div>

      {/* ✅ conteúdo sempre clicável */}
      <div className="relative z-10 w-full flex justify-center">
        {children}
      </div>
    </div>
  );
}

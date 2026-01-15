import type { ReactNode } from "react";
import AuthBackground from "@/components/auth/AuthBackground";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      <AuthBackground />
      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        {children}
      </div>
    </div>
  );
}

import type { ReactNode } from "react";
import AuthBackground from "@/components/auth/AuthBackground";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center px-4">
      <AuthBackground />
      <div className="w-full max-w-md relative z-10">{children}</div>
    </div>
  );
}

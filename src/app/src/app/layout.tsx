import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aluga — Inquilino & Proprietário",
  description: "App completo com login e paywall para modo proprietário.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <div className="min-h-screen">
          <div className="pointer-events-none fixed inset-0 overflow-hidden">
            <div className="absolute -top-24 left-1/2 h-72 w-[40rem] -translate-x-1/2 rounded-full bg-primary/25 blur-3xl" />
            <div className="absolute top-40 -left-24 h-72 w-72 rounded-full bg-secondary/25 blur-3xl" />
            <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-accent/20 blur-3xl" />
          </div>
          <div className="relative">{children}</div>
        </div>
      </body>
    </html>
  );
}

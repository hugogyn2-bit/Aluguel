import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aluga — Inquilino & Proprietário",
  description: "App completo com login e paywall para modo proprietário.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-black text-white">
        {children}
      </body>
    </html>
  );
}

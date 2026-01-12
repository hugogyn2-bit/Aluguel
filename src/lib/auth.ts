import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const credsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1), // ⚠️ relaxado só para diagnóstico
});

export const authOptions: NextAuthOptions = {
  debug: true, // 🔥 MUITO IMPORTANTE
  session: { strategy: "jwt" },
  pages: { signIn: "/auth/sign-in" },
  providers: [
    CredentialsProvider({
      id: "credentials", // ⚠️ força o ID correto
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        console.log("👉 AUTHORIZE CHAMADO");
        console.log("CREDENTIALS:", credentials);

        if (!credentials?.email || !credentials?.password) {
          console.log("❌ Credenciais vazias");
          return null;
        }

        const email = credentials.email.toLowerCase().trim();
        const password = credentials.password;

        console.log("EMAIL NORMALIZADO:", email);

        const user = await prisma.user.findFirst({
          where: {
            email: {
              equals: email,
              mode: "insensitive",
            },
          },
        });

        console.log("USUÁRIO ENCONTRADO:", user ? "SIM" : "NÃO");

        if (!user) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        console.log("SENHA CONFERE:", ok);

        if (!ok) return null;

        console.log("✅ LOGIN OK");

        return {
          id: user.id,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      (session.user as any).id = token.id;
      (session.user as any).role = token.role;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

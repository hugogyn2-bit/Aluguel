import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const handler = NextAuth({
  session: { strategy: "jwt" },

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        // Usamos o campo "email" como identificador (Email ou CPF)
        email: { label: "Email ou CPF", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const identifierRaw = String(credentials?.email ?? "").trim().toLowerCase();
        const password = String(credentials?.password ?? "");

        if (!identifierRaw || !password) return null;

        // Se não tiver "@", tratamos como CPF (somente números)
        const identifier = identifierRaw.includes("@")
          ? identifierRaw
          : identifierRaw.replace(/\D/g, "");

        const user = identifierRaw.includes("@")
          ? await prisma.user.findUnique({ where: { email: identifier } })
          : await prisma.user.findFirst({
              where: {
                tenantProfile: {
                  cpf: identifier,
                },
              },
            });
        if (!user) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          role: user.role,
          ownerPaid: user.ownerPaid,
          trialEndsAt: user.trialEndsAt ? user.trialEndsAt.toISOString() : undefined,
        } as any;
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
        token.ownerPaid = (user as any).ownerPaid;
        token.trialEndsAt = (user as any).trialEndsAt; // string ISO | undefined
      }
      return token;
    },

    async session({ session, token }) {
      (session as any).user.id = token.id;
      (session as any).user.role = token.role;
      (session as any).user.ownerPaid = token.ownerPaid;
      (session as any).user.trialEndsAt = token.trialEndsAt;
      return session;
    },
  },

  pages: { signIn: "/auth/sign-in" },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };

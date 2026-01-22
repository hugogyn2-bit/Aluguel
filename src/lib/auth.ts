import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toLowerCase();
        const password = credentials?.password;

        if (!email || !password) return null;

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          ownerPaid: user.ownerPaid,
          trialEndsAt: user.trialEndsAt,
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // quando loga
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
        token.ownerPaid = (user as any).ownerPaid;
        token.trialEndsAt = (user as any).trialEndsAt;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).ownerPaid = token.ownerPaid;
        (session.user as any).trialEndsAt = token.trialEndsAt;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/sign-in",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true,
};

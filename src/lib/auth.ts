import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const credsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/sign-in",
  },
  providers: [
    CredentialsProvider({
      name: "Email e Senha",
      credentials: { email: { label: "Email" }, password: { label: "Senha", type: "password" } },
      async authorize(credentials) {
        const parsed = credsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const user = await prisma.user.findUnique({ where: { email } });
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
      // on login
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
        token.ownerPaid = (user as any).ownerPaid;
        token.trialEndsAt = (user as any).trialEndsAt;
      }
      // refresh from db occasionally
      if (token?.id) {
        const dbUser = await prisma.user.findUnique({ where: { id: token.id as string } });
        if (dbUser) {
          token.role = dbUser.role;
          token.ownerPaid = dbUser.ownerPaid;
          token.trialEndsAt = dbUser.trialEndsAt ? dbUser.trialEndsAt.toISOString() : undefined;
          token.email = dbUser.email;
          token.name = dbUser.name ?? undefined;
        }
      }
      return token;
    },
    async session({ session, token }) {
      (session.user as any).id = token.id;
      (session.user as any).role = token.role;
      (session.user as any).ownerPaid = token.ownerPaid;
      (session.user as any).trialEndsAt = token.trialEndsAt;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

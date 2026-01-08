import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const handler = NextAuth({
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        identifier: { label: "Email", type: "text" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        const identifier = String(credentials?.identifier ?? "").trim().toLowerCase();
        const password = String(credentials?.password ?? "");

        if (!identifier || !password) return null;

        const user = await prisma.user.findUnique({ where: { email: identifier } });
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
        token.trialEndsAt = (user as any).trialEndsAt;
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

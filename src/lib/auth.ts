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
      credentials: {
        email: { label: "Email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        // ✅ NORMALIZA o e-mail (o cadastro salva assim)
        const emailNorm = email.toLowerCase().trim();

        const user = await prisma.user.findUnique({ where: { email: emailNorm } });
        if (!user) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        return {
          id: user.id,
          email: user.email,
          name: (user as any).name ?? undefined,
          role: user.role,
          ownerPaid: (user as any).ownerPaid,
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // on login
      if (user) {
        token.uid = (user as any).id;
        (token as any).id = (user as any).id;
        token.role = (user as any).role;
        token.ownerPaid = (user as any).ownerPaid;
      }

      // refresh from db
      if (token?.uid) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.uid as string },
        });

        if (dbUser) {
          (token as any).id = dbUser.id;
          token.role = dbUser.role;
          token.ownerPaid = (dbUser as any).ownerPaid;
          (token as any).mustChangePassword = (dbUser as any).mustChangePassword;
          (token as any).trialEndsAt = (dbUser as any).trialEndsAt
            ? (dbUser as any).trialEndsAt.toISOString()
            : undefined;
          token.email = dbUser.email;
          token.name = (dbUser as any).name ?? undefined;
        }
      }

      return token;
    },
    async session({ session, token }) {
      (session.user as any).id = (token as any).id ?? (token as any).uid;
      (session.user as any).role = token.role;
      (session.user as any).ownerPaid = token.ownerPaid;
      (session.user as any).trialEndsAt = (token as any).trialEndsAt;
      (session.user as any).mustChangePassword = (token as any).mustChangePassword;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

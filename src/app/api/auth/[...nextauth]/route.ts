import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const authHandler = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  debug: true,

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Senha", type: "password" },
      },

      async authorize(credentials) {
        const email = String(credentials?.email || "").toLowerCase().trim();
        const password = String(credentials?.password || "");

        if (!email || !password) return null;

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        // ✅ retorna usuário "mínimo"
        return {
          id: user.id,
          email: user.email,
        };
      },
    }),
  ],

  callbacks: {
    // ✅ Ao logar: aplicar trial automático 24h se for OWNER e não for premium
    async signIn({ user }) {
      try {
        if (!user?.email) return true;

        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (!dbUser) return true;

        // Só OWNER ganha trial
        if (dbUser.role === "OWNER") {
          const now = new Date();

          const hasTrial =
            dbUser.trialEndsAt && dbUser.trialEndsAt > now;

          if (!dbUser.ownerPaid && !hasTrial) {
            const trialEndsAt = new Date();
            trialEndsAt.setHours(trialEndsAt.getHours() + 24);

            await prisma.user.update({
              where: { email: dbUser.email },
              data: { trialEndsAt },
            });

            console.log("✅ TRIAL 24H ativado para", dbUser.email);
          }
        }

        return true;
      } catch (e) {
        console.log("SIGNIN TRIAL ERROR:", e);
        return true;
      }
    },

    // ✅ Enfia dados no token para o middleware usar
    async jwt({ token }) {
      if (!token?.email) return token;

      const user = await prisma.user.findUnique({
        where: { email: token.email },
        select: { ownerPaid: true, trialEndsAt: true, role: true },
      });

      token.ownerPaid = user?.ownerPaid ?? false;
      token.trialEndsAt = user?.trialEndsAt?.toISOString() ?? null;
      token.role = user?.role ?? "TENANT";

      return token;
    },

    // ✅ Disponível no front
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).ownerPaid = token.ownerPaid;
        (session.user as any).trialEndsAt = token.trialEndsAt;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
});

export { authHandler as GET, authHandler as POST };

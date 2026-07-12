import NextAuth, { type NextAuthConfig } from "next-auth";
import type { Provider } from "next-auth/providers";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";

import { env } from "@/config/env";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/schemas/auth";

const oauthProviders: Provider[] = [];

if (env.AUTH_GOOGLE_ID && env.AUTH_GOOGLE_SECRET) {
  oauthProviders.push(
    Google({
      clientId: env.AUTH_GOOGLE_ID,
      clientSecret: env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: false,
    }),
  );
}

if (
  env.AUTH_MICROSOFT_ENTRA_ID_ID &&
  env.AUTH_MICROSOFT_ENTRA_ID_SECRET &&
  env.AUTH_MICROSOFT_ENTRA_ID_ISSUER
) {
  oauthProviders.push(
    MicrosoftEntraID({
      clientId: env.AUTH_MICROSOFT_ENTRA_ID_ID,
      clientSecret: env.AUTH_MICROSOFT_ENTRA_ID_SECRET,
      issuer: env.AUTH_MICROSOFT_ENTRA_ID_ISSUER,
    }),
  );
}

export const authConfig = {
  adapter: PrismaAdapter(prisma as never),
  trustHost: env.AUTH_TRUST_HOST,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  providers: [
    Credentials({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(rawCredentials) {
        const parsed = loginSchema.safeParse(rawCredentials);

        if (!parsed.success) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
          select: {
            id: true,
            name: true,
            email: true,
            password: true,
            role: true,
            is_active: true,
            image: true,
            avatar: true,
            employees: {
              select: {
                first_name: true,
                last_name: true,
              },
            },
          },
        });

        if (!user?.password || !user.is_active) {
          return null;
        }

        const passwordMatches = await bcrypt.compare(parsed.data.password, user.password);

        if (!passwordMatches) {
          return null;
        }

        const employeeName = user.employees
          ? `${user.employees.first_name} ${user.employees.last_name}`.trim()
          : null;

        return {
          id: user.id,
          name: user.name ?? employeeName ?? user.email,
          email: user.email,
          image: user.image ?? user.avatar ?? null,
          role: user.role,
          isActive: user.is_active,
        };
      },
    }),
    ...oauthProviders,
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.isActive = user.isActive;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.id);
        session.user.role = String(token.role ?? "EMPLOYEE");
        session.user.isActive = Boolean(token.isActive ?? true);
      }

      return session;
    },
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

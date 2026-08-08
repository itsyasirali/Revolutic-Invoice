/* eslint-disable @typescript-eslint/no-explicit-any */
import bcrypt from "bcrypt";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { getDatabase } from "@/lib/database";
import { User } from "@/entities/User";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const db = await getDatabase();
          const userRepository = db.getRepository(User);

          const user = await userRepository.findOneBy({
            email: credentials.email as string,
          });

          if (!user) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          );

          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user.id.toString(),
            name: user.name || `${user.firstName || ""} ${user.lastName || ""}`.trim() || null,
            email: user.email,
            companyName: user.companyName,
            firstName: user.firstName,
            lastName: user.lastName,
          };
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.companyName = (user as any).companyName;
        token.firstName = (user as any).firstName;
        token.lastName = (user as any).lastName;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        (session.user as any).companyName = token.companyName;
        (session.user as any).firstName = token.firstName;
        (session.user as any).lastName = token.lastName;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth",
  },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "fallback-secret-for-development-do-not-use-in-prod",
});

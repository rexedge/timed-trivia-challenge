import type { NextAuthConfig } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { UserRole } from "@prisma/client";

export const authConfig: NextAuthConfig = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          access_type: "offline",
          prompt: "consent",
          response_type: "code",
        },
      },
    }),
  ],
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = request.nextUrl.pathname.startsWith("/dashboard");
      const isOnAdmin = request.nextUrl.pathname.startsWith("/admin");

      if (isOnAdmin) {
        return isLoggedIn && auth?.user?.role === UserRole.ADMIN;
      }

      if (isOnDashboard) {
        return isLoggedIn;
      }

      return true;
    },
    async jwt({ token, user, account, profile }) {
       if (account && user) {
         return {
           ...token,
           role: user.role,
           phoneNumber: user.phoneNumber,
           profession: user.profession,
         };
       }
       return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.role = token.role as UserRole;
        session.user.phoneNumber = token.phoneNumber as string;
        session.user.profession = token.profession as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/error",
  },
};

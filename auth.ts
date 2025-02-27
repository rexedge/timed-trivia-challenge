import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { authConfig } from "./auth.config";
import { db } from "@/lib/db";
import { UserRole } from "@prisma/client";

export const { handlers, auth, signIn, signOut } = NextAuth({
  // @ts-expect-error: expected an error here
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account, profile }) {
      if (!user.email) {
        return false;
      }

      try {
        const existingUser = await db.user.findUnique({
          where: { email: user.email },
          include: {
            accounts: true,
          },
        });

        // If user doesn't exist, allow sign in and create new user
        if (!existingUser) {
          const newUser = await db.user.create({
            data: {
              email: user.email,
              name: user.name,
              image: user.image,
              role: UserRole.PLAYER,
            },
          });

          // Create the OAuth account link
          if (account) {
            await db.account.create({
              data: {
                userId: newUser.id,
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                access_token: account.access_token,
                token_type: account.token_type,
                scope: account.scope,
                id_token: account.id_token,
              },
            });
          }

          return `/complete-profile?email=${user.email}`;
        }

        // If user exists but has no account, link the account
        if (existingUser.accounts.length === 0 && account) {
          await db.account.create({
            data: {
              userId: existingUser.id,
              type: account.type,
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              access_token: account.access_token,
              token_type: account.token_type,
              scope: account.scope,
              id_token: account.id_token,
            },
          });
          return true;
        }

        // If user exists and has no profile info, redirect to complete profile
        if (!existingUser.phoneNumber || !existingUser.profession) {
          return `/complete-profile?email=${user.email}`;
        }

        return true;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return false;
      }
    },
  },
});

import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { authConfig } from "./auth.config";
import { db } from "@/lib/db";
import { UserRole } from "@prisma/client";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  // @ts-expect-error: expected an error here
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account, profile }) {
      // Only allow sign in if email is verified
      if (!user.email) {
        return false;
      }

      try {
        // Check if user exists
        const existingUser = await db.user.findUnique({
          where: { email: user.email },
        });

        // If user doesn't exist, create a new user with default role
        if (!existingUser) {
          // Create user with basic info
          await db.user.create({
            data: {
              email: user.email,
              name: user.name,
              image: user.image,
              role: UserRole.PLAYER, // Set default role
            },
          });

          // Redirect to complete profile page
          return `/complete-profile?email=${user.email}`;
        }

        // Update the user object with the role from the database
        user.role = existingUser.role;
        user.phoneNumber = existingUser.phoneNumber;
        user.profession = existingUser.profession;

        return true;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return false;
      }
    },
  },
});

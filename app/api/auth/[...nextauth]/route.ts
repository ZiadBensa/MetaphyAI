import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import type { NextAuthOptions } from "next-auth"
import prisma from "@/lib/prisma" // Import your Prisma client

export const authOptions: NextAuthOptions = {
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET ?? "dev-secret-do-not-use-in-prod",
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "dev-google-client-id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "dev-google-client-secret",
      authorization: {
        params: {
          scope: "openid email profile https://www.googleapis.com/auth/drive.file"
        }
      }
    }),
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      // Persist the OAuth access_token to the token right after signin
      if (account && user) {
        token.accessToken = account.access_token

        // Use Prisma to find or create the user in your database
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email as string },
          })

          if (existingUser) {
            // Update existing user's Google ID and other details if necessary
            const updatedUser = await prisma.user.update({
              where: { id: existingUser.id },
              data: {
                googleId: user.id, // Ensure Google ID is linked
                name: user.name,
                image: user.image,
              },
            })
            token.userId = updatedUser.id
          } else {
            // Create a new user
            const newUser = await prisma.user.create({
              data: {
                googleId: user.id,
                email: user.email as string,
                name: user.name,
                image: user.image,
              },
            })
            token.userId = newUser.id
          }
        } catch (error) {
          console.error("Prisma user upsert failed:", error)
          // Optionally, throw an error to prevent sign-in if database operation fails
          // throw new Error("Failed to link account with application database.")
        }
      }
      return token
    },
    async session({ session, token }) {
      // Send properties to the client
      session.accessToken = token.accessToken as string
      session.userId = token.userId as string // This is now your internal database user ID
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

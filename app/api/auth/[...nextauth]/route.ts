import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { NextAuthOptions } from "next-auth"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'openid email profile https://www.googleapis.com/auth/drive.file'
        }
      }
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user) {
        // New user signing in
        return {
          ...token,
          userId: user.id,
          accessToken: account.access_token,
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token.userId) {
        session.userId = token.userId as string
      }
      if (token.accessToken) {
        session.accessToken = token.accessToken as string
      }
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

export async function GET(request: Request, context: { params: Promise<{ nextauth: string[] }> }) {
  const { params } = await context
  return handler(request, { params })
}

export async function POST(request: Request, context: { params: Promise<{ nextauth: string[] }> }) {
  const { params } = await context
  return handler(request, { params })
}

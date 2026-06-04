import { type NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import dbConnect from "@/lib/db/mongoose"
import User from "@/lib/models/userSchema"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET ?? "development-secret",
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "you@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null

        await dbConnect()

        const user = await User.findOne({ email: credentials.email }).lean()
        if (!user) return null

        const passwordMatches = await bcrypt.compare(
          credentials.password,
          user.password
        )
        if (!passwordMatches) return null

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
}

export default authOptions

import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import { compare } from "bcryptjs"
import type { UserRole } from "@prisma/client"
import { getNextAuthSecret } from "@/lib/nextauth-secret"

type AuthUser = {
  id: string
  email: string
  name: string | null
  role: UserRole
  patientId: string | null
}

export const authOptions: NextAuthOptions = {
  secret: getNextAuthSecret(),
  session: {
    strategy: "jwt",
  },
  logger: {
    error(code, metadata) {
      if (code === "JWT_SESSION_ERROR") return
      console.error("[next-auth][error]", code, metadata)
    },
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { patient: true },
        })

        if (!user) return null

        const isValid = await compare(credentials.password, user.passwordHash)
        if (!isValid) return null

        const authUser: AuthUser = {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          patientId: user.patientId,
        }

        return authUser
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as AuthUser
        token.id = u.id
        token.role = u.role
        token.patientId = u.patientId
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.patientId = token.patientId ?? null
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
}

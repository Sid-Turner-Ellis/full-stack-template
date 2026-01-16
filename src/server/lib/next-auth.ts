import "server-only"

import { randomBytes, scryptSync, timingSafeEqual } from "crypto"
import { PrismaAdapter } from "@auth/prisma-adapter"
import NextAuth, { type DefaultSession, type NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { cache } from "react"
import { z } from "zod"

import { db } from "~/server/lib/db"
const HASH_KEY_LENGTH = 64

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex")
  const hash = scryptSync(password, salt, HASH_KEY_LENGTH).toString("hex")

  return { hash, salt }
}

export function verifyPassword(
  password: string,
  hash: string,
  salt: string
) {
  const stored = Buffer.from(hash, "hex")
  const derived = scryptSync(password, salt, HASH_KEY_LENGTH)

  if (stored.length !== derived.length) return false

  return timingSafeEqual(stored, derived)
}

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
const credentialsSchema = z.object({
  handle: z.string().trim().min(1).max(100),
  password: z.string().min(1),
})

export const authConfig = {
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        handle: { label: "X tag", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const parsed = credentialsSchema.safeParse(credentials)
        if (!parsed.success) return null

        const rawHandle = parsed.data.handle.trim()
        const handle = rawHandle.startsWith("@") ? rawHandle : `@${rawHandle}`
        const handleNoAt = rawHandle.startsWith("@")
          ? rawHandle.slice(1)
          : rawHandle
        const user = await db.user.findFirst({
          where: {
            OR: [{ name: handle }, { name: handleNoAt }],
          },
        })

        if (!user?.passwordHash || !user.passwordSalt) return null
        const isValid = verifyPassword(
          parsed.data.password,
          user.passwordHash,
          user.passwordSalt
        )

        if (!isValid) return null

        return {
          id: user.id,
          name: user.name,
          email: user.email,
        }
      },
    }),
  ],
  adapter: PrismaAdapter(db),
  pages: {
    signIn: "/signin",
  },
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
      },
    }),
  },
} satisfies NextAuthConfig;

const { auth: uncachedAuth, handlers, signIn, signOut } = NextAuth(authConfig)

const auth = cache(uncachedAuth)

export { auth, handlers, signIn, signOut }

import { NextResponse } from "next/server"
import { z } from "zod"

import { hashPassword } from "~/server/lib/next-auth"
import { db } from "~/server/lib/db"

const registerSchema = z.object({
  name: z.string().trim().min(1).max(100).optional().or(z.literal("")),
  email: z.string().email(),
  password: z.string().min(8),
})

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const parsed = registerSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input." }, { status: 400 })
  }

  const email = parsed.data.email.toLowerCase()
  const existingUser = await db.user.findUnique({ where: { email } })

  if (existingUser) {
    return NextResponse.json(
      { error: "An account already exists for that email." },
      { status: 409 }
    )
  }

  const { hash, salt } = hashPassword(parsed.data.password)
  const name = parsed.data.name?.trim()

  const user = await db.user.create({
    data: {
      email,
      name: name ? name : null,
      passwordHash: hash,
      passwordSalt: salt,
    },
  })

  return NextResponse.json({ id: user.id }, { status: 201 })
}

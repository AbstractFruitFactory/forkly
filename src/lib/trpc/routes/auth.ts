import { t } from '../t'
import { db } from '$lib/server/db'
import * as table from '$lib/server/db/schema'
import { hash } from '@node-rs/argon2'
import { encodeBase32LowerCase } from '@oslojs/encoding'
import { eq } from 'drizzle-orm'
import * as auth from '$lib/server/auth'
import * as v from 'valibot'
import { Ok, Err } from 'ts-results-es'
import { validate } from '$lib/server/form-validation'

const signupSchema = v.object({
  username: v.pipe(
    v.string(),
    v.minLength(3, 'Username must be at least 3 characters'),
    v.maxLength(31, 'Username must be at most 31 characters'),
    v.regex(/^[a-z0-9_-]+$/, 'Username can only contain lowercase letters, numbers, underscores, and hyphens')
  ),
  password: v.pipe(
    v.string(),
    v.minLength(6, 'Password must be at least 6 characters'),
    v.maxLength(255, 'Password must be at most 255 characters')
  )
})

const generateUserId = () => {
  const bytes = crypto.getRandomValues(new Uint8Array(15))
  const id = encodeBase32LowerCase(bytes)
  return id
}

export const authRouter = t.router({
  signup: t.procedure
    .input(validate(signupSchema))
    .mutation(async ({ input, ctx }) => {
      if (input.isErr()) {
        return input
      }

      // Check if username already exists
      const existingUser = await db
        .select()
        .from(table.user)
        .where(eq(table.user.username, input.value.username))
        .then(results => results[0])

      if (existingUser) {
        return Err(new Error('Username already taken'))
      }

      const userId = generateUserId()
      const passwordHash = await hash(input.value.password, {
        memoryCost: 19456,
        timeCost: 2,
        outputLen: 32,
        parallelism: 1
      })

      await db.insert(table.user).values({
        id: userId,
        username: input.value.username,
        passwordHash
      })

      const sessionToken = auth.generateSessionToken()
      const session = await auth.createSession(sessionToken, userId)

      // Set the session cookie
      ctx.event.cookies.set(auth.sessionCookieName, sessionToken, {
        expires: session.expiresAt,
        path: '/'
      })

      return Ok({
        user: {
          id: userId,
          username: input.value.username
        }
      })
    })
}) 
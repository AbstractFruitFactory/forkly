import { TRPCError } from '@trpc/server'
import { t } from '../t'
import { db } from '$lib/server/db'
import { user } from '$lib/server/db/schema'
import * as v from 'valibot'
import { eq } from 'drizzle-orm'
import { uploadImage, deleteImage } from '$lib/server/cloudinary'
import { Err, Ok } from 'ts-results-es'

const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.event.locals.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.event.locals.user
    }
  })
})

const updateProfileSchema = v.object({
  username: v.pipe(
    v.string(),
    v.minLength(3, 'Username must be at least 3 characters'),
    v.maxLength(31, 'Username must be at most 31 characters'),
    v.regex(/^[a-z0-9_-]+$/, 'Username can only contain lowercase letters, numbers, underscores, and hyphens')
  ),
  bio: v.optional(v.string()),
  avatarUrl: v.optional(v.string())
})

export const profileRouter = t.router({
  update: protectedProcedure
    .input(v.parser(updateProfileSchema))
    .mutation(async ({ input, ctx }) => {
      // Check if username is taken (if it's different from current username)
      if (input.username !== ctx.user.username) {
        const existingUser = await db
          .select()
          .from(user)
          .where(eq(user.username, input.username))
          .then(results => results[0])

        if (existingUser) {
          return Err(new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Username is already taken'
          }))
        }
      }

      // Get current user to check for existing avatar
      if (input.avatarUrl) {
        const currentUser = await db
          .select()
          .from(user)
          .where(eq(user.id, ctx.user.id))
          .then(results => results[0])

        // Delete old avatar if it exists and is different
        if (currentUser?.avatarUrl && currentUser.avatarUrl !== input.avatarUrl) {
          await deleteImage(currentUser.avatarUrl)
        }
      }

      const updateData: Partial<typeof user.$inferSelect> = {
        username: input.username,
        bio: input.bio,
        ...(input.avatarUrl ? { avatarUrl: input.avatarUrl } : {})
      }

      const updatedUser = await db
        .update(user)
        .set(updateData)
        .where(eq(user.id, ctx.user.id))
        .returning()

      return Ok(updatedUser[0])
    })
}) 
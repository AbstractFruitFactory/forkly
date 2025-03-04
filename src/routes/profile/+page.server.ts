import { error, fail } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import { json } from '@sveltejs/kit'
import { db } from '$lib/server/db'
import { user } from '$lib/server/db/schema'
import { eq } from 'drizzle-orm'
import * as v from 'valibot'
import { deleteImage } from '$lib/server/cloudinary'

const updateProfileSchema = v.object({
  username: v.pipe(
    v.string(),
    v.minLength(3, 'Username must be at least 3 characters'),
    v.maxLength(31, 'Username must be at most 31 characters'),
    v.regex(/^[a-z0-9_-]+$/, 'Username can only contain lowercase letters, numbers, underscores, and hyphens')
  ),
  bio: v.optional(v.string()),
  avatarUrl: v.nullish(v.string())
})

export const load: PageServerLoad = async ({ locals, fetch }) => {
  if (!locals.user) error(401, 'Unauthorized')

  const recipesResponse = await fetch('/api/recipes/user')
  if (!recipesResponse.ok) error(500, 'Failed to load recipes')

  const recipesData = await recipesResponse.json()
  
  return { 
    recipes: recipesData.created, 
    bookmarkedRecipes: recipesData.bookmarked, 
    user: locals.user 
  }
}

export const actions = {
  default: async ({ request, locals }) => {
    if (!locals.user) error(401, 'Unauthorized')

    const formData = await request.formData()
    const username = formData.get('username')
    const bio = formData.get('bio')
    const avatarUrl = formData.get('avatarUrl')

    if (!username) return fail(400, {
      error: 'Username is required'
    })

    const { success, issues, output } = v.safeParse(updateProfileSchema, {
      username,
      bio,
      avatarUrl
    })

    if (!success) return fail(400, {
      error: issues[0].message
    })

    if (output.username !== locals.user.username) {
      const existingUser = await db
        .select()
        .from(user)
        .where(eq(user.username, output.username))
        .then(results => results[0])

      if (existingUser) fail(400, { error: 'Username is already taken' })
    }

    if (output.avatarUrl) {
      const currentUser = await db
        .select()
        .from(user)
        .where(eq(user.id, locals.user.id))
        .then(results => results[0])

      if (currentUser?.avatarUrl && currentUser.avatarUrl !== output.avatarUrl) {
        await deleteImage(currentUser.avatarUrl)
      }
    }

    const updateData: Partial<typeof user.$inferSelect> = {
      username: output.username,
      bio: output.bio,
      ...(output.avatarUrl ? { avatarUrl: output.avatarUrl } : {})
    }

    const updatedUser = await db
      .update(user)
      .set(updateData)
      .where(eq(user.id, locals.user.id))
      .returning()

    return {
      user: updatedUser[0]
    }
  }
} satisfies Actions 
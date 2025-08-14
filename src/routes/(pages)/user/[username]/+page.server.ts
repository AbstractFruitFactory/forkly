import { error, fail } from '@sveltejs/kit'
import { getUserByUsername, updateUserProfile } from '$lib/server/db/user'
import * as v from 'valibot'
import { deleteImage } from '$lib/server/cloudinary'
import { safeFetch } from '$lib/utils/fetch'
import { buildRecipePayloadFromForm } from '$lib/server/utils/recipe-form'
import type { RequestEvent } from '@sveltejs/kit'

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

export const actions = {
  updateUser: async ({ request, locals }: RequestEvent) => {
    if (!locals.user) error(401, 'Unauthorized')

    const formData = await request.formData()
    const username = formData.get('username')?.toString()
    const bio = formData.get('bio')?.toString()
    const avatarUrl = formData.get('avatarUrl')?.toString()

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
      const existingUser = await getUserByUsername(output.username)
      if (existingUser) fail(400, { error: 'Username is already taken' })
    }

    if (output.avatarUrl && locals.user.avatarUrl && locals.user.avatarUrl !== output.avatarUrl) {
      await deleteImage(locals.user.avatarUrl)
    }

    const updateData = {
      username: output.username,
      bio: output.bio,
      ...(output.avatarUrl ? { avatarUrl: output.avatarUrl } : {})
    }

    const updatedUser = await updateUserProfile(locals.user.id, updateData)

    return {
      user: updatedUser
    }
  }
} 
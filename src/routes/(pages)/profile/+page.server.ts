import { error, fail } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import { getUserById, getUserByUsername, updateUserProfile } from '$lib/server/db/user'
import * as v from 'valibot'
import { deleteImage } from '$lib/server/cloudinary'
import { safeFetch } from '$lib/utils/fetch'
import type { UserRecipes } from '../../api/recipes/user/+server'
import { getCollections } from '$lib/server/db/save'

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

export const load: PageServerLoad = ({ locals, fetch, url }) => {
  if (!locals.user) error(401, 'Unauthorized')

  const recipesPromise = safeFetch<UserRecipes>(fetch)('/api/recipes/user').then((r) => {
    if (r.isErr()) error(500, 'Failed to load recipes')
    return r.value.created
  })

  const user = getUserById(locals.user.id)
  const collections = getCollections(locals.user.id)

  const tab = url.searchParams.get('tab')

  return {
    recipes: recipesPromise,
    collections,
    user,
    initialTab: tab ?? undefined
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
} satisfies Actions 
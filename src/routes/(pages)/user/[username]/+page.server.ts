import { error, fail } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import { getUserById, getUserByUsername, getPublicUserByUsername, updateUserProfile, type User } from '$lib/server/db/user'
import * as v from 'valibot'
import { deleteImage } from '$lib/server/cloudinary'
import { safeFetch } from '$lib/utils/fetch'
import type { UserRecipes } from '../../../(api)/recipes/user/+server'
import { getCollections } from '$lib/server/db/save'
import { getRecipes, type RecipeFilter, type DetailedRecipe } from '$lib/server/db/recipe'

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

export const load: PageServerLoad = async ({ locals, fetch, url, params }) => {
  const { username } = params

  const tab = url.searchParams.get('tab')
  const isOwner = locals.user && locals.user.username === username || false

  let profileUser: User

  if (isOwner) {
    profileUser = await getUserByUsername(username)
  } else {
    profileUser = await getPublicUserByUsername(username)
  }

  if (!profileUser) error(404, 'User not found')

  let recipes: DetailedRecipe[]
  let collections: { name: string; count: number }[]

  if (isOwner) {
    const userRecipes = await safeFetch<UserRecipes>(fetch)('/recipes/user')
    if (userRecipes.isErr()) error(500, 'Failed to load recipes')
    recipes = userRecipes.value.created
    collections = await getCollections(locals.user!.id)
  } else {
    recipes = await getRecipes({
      userId: profileUser.id,
      detailed: true
    })
    collections = []
  }

  return {
    profileUser,
    currentUser: locals.user,
    isOwner,
    recipes,
    collections,
    initialTab: tab ?? undefined
  }
}

export const actions = {
  default: async ({ request, locals, params }) => {
    if (!locals.user) error(401, 'Unauthorized')

    const { username } = params
    if (!username) error(400, 'Username is required')

    const profileUser = await getUserByUsername(username)
    if (!profileUser) error(404, 'User not found')

    if (profileUser.id !== locals.user.id) error(403, 'Forbidden')

    const formData = await request.formData()
    const newUsername = formData.get('username')
    const bio = formData.get('bio')
    const avatarUrl = formData.get('avatarUrl')

    if (!newUsername) return fail(400, {
      error: 'Username is required'
    })

    const { success, issues, output } = v.safeParse(updateProfileSchema, {
      username: newUsername,
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
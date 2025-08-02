import { error, fail, redirect } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import { getUserById, getUserByUsername, getPublicUserByUsername, updateUserProfile, type User } from '$lib/server/db/user'
import * as v from 'valibot'
import { deleteImage } from '$lib/server/cloudinary'
import { safeFetch } from '$lib/utils/fetch'
import type { UserRecipes } from '../../../(api)/recipes/user/+server'
import { getCollections } from '$lib/server/db/save'
import { getRecipes, type RecipeFilter, type DetailedRecipe, getRecipeDraftsByUser } from '$lib/server/db/recipe'
import type { RecipeDraft } from '$lib/server/db/schema'
import { buildRecipePayloadFromForm, type RecipeApiResponse } from '$lib/server/utils/recipe-form'
import { actions as newRecipeActions } from '../../new/+page.server'

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
  let drafts: RecipeDraft[] = []

  if (isOwner) {
    const userRecipes = await safeFetch<UserRecipes>(fetch)('/recipes/user')
    if (userRecipes.isErr()) error(500, 'Failed to load recipes')
    recipes = userRecipes.value.created
    collections = await getCollections(locals.user!.id)
    const rawDrafts = await getRecipeDraftsByUser(locals.user!.id)
    drafts = rawDrafts.map(draft => ({
      ...draft,
      instructions: typeof draft.instructions === 'string' ? JSON.parse(draft.instructions) : draft.instructions,
      tags: typeof draft.tags === 'string' ? JSON.parse(draft.tags) : draft.tags
    }))
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
    drafts,
    initialTab: tab ?? undefined
  }
}

export const actions = {
  updateUser: async ({ request, locals, params }) => {
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
  },
  updateRecipe: async ({ request, fetch }) => {
    const formData = await request.formData()
    const recipeId = formData.get('id')?.toString()
    if (!recipeId) {
      return fail(400, {
        success: false,
        errors: [{
          path: 'id',
          message: 'Recipe ID is required for updates'
        }]
      })
    }

    const { payload, error } = await buildRecipePayloadFromForm(formData)
    if (error) return error

    const fetchResponse = await safeFetch<RecipeApiResponse>(fetch)(
      '/recipes/update',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, id: recipeId })
      }
    )
    if (fetchResponse.isErr()) {
      console.error('Error updating recipe', fetchResponse.error)
      return fail(500, {
        success: false,
        errors: [{
          path: 'api',
          message: 'An unexpected error occurred while updating the recipe'
        }]
      })
    }
    return {
      success: true,
      recipeId: fetchResponse.value.id
    }
  },
  saveDraft: async (event) => {
    return await newRecipeActions.saveDraft(event as any)
  },
  createRecipe: async (event) => {
    return await newRecipeActions.createRecipe(event as any)
  }
} satisfies Actions 
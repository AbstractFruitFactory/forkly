import { error, fail } from '@sveltejs/kit'
import { getUserByUsername, updateUserProfile } from '$lib/server/db/user'
import * as v from 'valibot'
import { deleteImage } from '$lib/server/cloudinary'
import { safeFetch } from '$lib/utils/fetch'
import { buildRecipePayloadFromForm, type RecipeApiResponse } from '$lib/server/utils/recipe-form'
import { actions as newRecipeActions } from '../../new/+page.server'
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
  },

  updateRecipe: async ({ request, fetch }: RequestEvent) => {
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

  saveDraft: async (event: RequestEvent) => {
    return await newRecipeActions.saveDraft(event as any)
  },

  createRecipe: async (event: RequestEvent) => {
    return await newRecipeActions.createRecipe(event as any)
  }
} 
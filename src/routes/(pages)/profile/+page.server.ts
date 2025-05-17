import { error, fail } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import { getUserByUsername, updateUserProfile } from '$lib/server/db/user'
import { getSavedRecipesByUser } from '$lib/server/db/save'
import { getRecipes, type DetailedRecipe } from '$lib/server/db/recipe'
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
  
  // Get saved recipes
  const savedRecipeIds = await getSavedRecipesByUser(locals.user.id)
  let savedRecipes: DetailedRecipe[] = []
  if (savedRecipeIds.length > 0) {
    savedRecipes = await getRecipes({
      recipeIds: savedRecipeIds,
      detailed: true
    })
  }
  
  return { 
    recipes: recipesData.created, 
    saved: savedRecipes, 
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
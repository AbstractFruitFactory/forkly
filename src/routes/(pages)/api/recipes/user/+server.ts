import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { getRecipes, type RecipeFilter, type DetailedRecipe } from '$lib/server/db/recipe'
import { getSavedRecipesByUser } from '$lib/server/db/save'

export type UserRecipes = {
  created: DetailedRecipe[]
  saved: DetailedRecipe[]
}

export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.user) error(401, { message: 'Unauthorized' })

  const createdFilters: RecipeFilter = {
    userId: locals.user.id,
    detailed: true
  }

  const createdRecipes = await getRecipes(createdFilters)
  const savedIds = await getSavedRecipesByUser(locals.user.id)

  let savedRecipes: DetailedRecipe[] = []
  if (savedIds.length > 0) {
    const savedFilters: RecipeFilter = {
      recipeIds: savedIds,
      detailed: true
    }
    savedRecipes = await getRecipes(savedFilters)
  }

  const createdWithType = createdRecipes.map(r => ({
    ...r,
    type: 'created'
  }))

  const savedWithType = savedRecipes.map(r => ({
    ...r,
    type: 'saved'
  }))

  return json({
    created: createdWithType,
    saved: savedWithType
  } satisfies UserRecipes)
} 
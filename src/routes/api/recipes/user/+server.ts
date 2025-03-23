import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { getRecipes, type RecipeFilter, type DetailedRecipe } from '$lib/server/db/recipe'
import { getUserBookmarkedRecipeIds } from '$lib/server/db/bookmark'

export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.user) error(401, { message: 'Unauthorized' })

  const createdFilters: RecipeFilter = {
    userId: locals.user.id,
    detailed: true
  }
  
  const createdRecipes = await getRecipes(createdFilters)
  const bookmarkedIds = await getUserBookmarkedRecipeIds(locals.user.id)
  
  let bookmarkedRecipes: DetailedRecipe[] = []
  if (bookmarkedIds.length > 0) {
    const bookmarkedFilters: RecipeFilter = {
      recipeIds: bookmarkedIds,
      detailed: true
    }
    bookmarkedRecipes = await getRecipes(bookmarkedFilters)
  }

  const createdWithType = createdRecipes.map(r => ({
    ...r,
    type: 'created'
  }))

  const bookmarkedWithType = bookmarkedRecipes.map(r => ({
    ...r,
    type: 'bookmarked'
  }))

  return json({
    created: createdWithType,
    bookmarked: bookmarkedWithType
  })
} 
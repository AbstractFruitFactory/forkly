import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { getRecipes, type RecipeFilter, type DetailedRecipe } from '$lib/server/db/recipe'
import { getUserLikedRecipeIds } from '$lib/server/db/like'

export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.user) error(401, { message: 'Unauthorized' })

  const createdFilters: RecipeFilter = {
    userId: locals.user.id,
    detailed: true
  }
  
  const createdRecipes = await getRecipes(createdFilters)
  const likedIds = await getUserLikedRecipeIds(locals.user.id)
  
  let likedRecipes: DetailedRecipe[] = []
  if (likedIds.length > 0) {
    const likedFilters: RecipeFilter = {
      recipeIds: likedIds,
      detailed: true
    }
    likedRecipes = await getRecipes(likedFilters)
  }

  const createdWithType = createdRecipes.map(r => ({
    ...r,
    type: 'created'
  }))

  const likedWithType = likedRecipes.map(r => ({
    ...r,
    type: 'liked'
  }))

  return json({
    created: createdWithType,
    liked: likedWithType
  })
} 
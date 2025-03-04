import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { getUserCreatedRecipes, getRecipesByIds } from '$lib/server/db/recipe'
import { getUserBookmarkedRecipeIds } from '$lib/server/db/bookmark'
import type { Recipe } from '$lib/server/db/schema'

export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.user) error(401, { message: 'Unauthorized' })

  const createdRecipes = await getUserCreatedRecipes(locals.user.id)
  const bookmarkedIds = await getUserBookmarkedRecipeIds(locals.user.id)
  
  let bookmarkedRecipes: Awaited<ReturnType<typeof getRecipesByIds>> = []
  if (bookmarkedIds.length > 0) {
    bookmarkedRecipes = await getRecipesByIds(bookmarkedIds)
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
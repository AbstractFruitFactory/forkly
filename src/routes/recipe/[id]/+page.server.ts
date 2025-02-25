import { error } from '@sveltejs/kit'
import { db } from '$lib/server/db'
import { recipe, recipeLike } from '$lib/server/db/schema'
import { and, eq } from 'drizzle-orm'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params, locals }) => {
  const recipeId = params.id

  const recipes = await db.select()
    .from(recipe)
    .where(eq(recipe.id, recipeId))

  const foundRecipe = recipes[0]

  if (!foundRecipe) throw error(404, 'Recipe not found')

  // Get like status if user is logged in
  let isLiked = false
  if (locals.user?.id) {
    const likes = await db
      .select()
      .from(recipeLike)
      .where(and(
        eq(recipeLike.recipeId, recipeId),
        eq(recipeLike.userId, locals.user.id)
      ))
    isLiked = likes.length > 0
  }

  const likes = await db
    .select()
    .from(recipeLike)
    .where(eq(recipeLike.recipeId, recipeId))

  return {
    recipe: {
      ...foundRecipe,
      isLiked,
      likes: likes.length
    },
    nutrition: foundRecipe.nutrition
  }
}
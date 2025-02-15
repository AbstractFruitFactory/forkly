import { error } from '@sveltejs/kit'
import { db } from '$lib/server/db'
import { recipe } from '$lib/server/db/schema'
import { eq } from 'drizzle-orm'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params }) => {
  const recipeId = parseInt(params.id)

  const recipes = await db.select().from(recipe).where(eq(recipe.id, recipeId))
  const foundRecipe = recipes[0]

  if (!foundRecipe) {
    throw error(404, 'Recipe not found')
  }

  return {
    recipe: foundRecipe
  }
} 
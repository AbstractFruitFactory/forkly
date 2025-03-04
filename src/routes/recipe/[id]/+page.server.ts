import { error } from '@sveltejs/kit'
import { getRecipeWithDetails } from '$lib/server/db/recipe'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params, locals }) => {
  const recipeId = params.id
  const userId = locals.user?.id

  const result = await getRecipeWithDetails(recipeId, userId)
  if (!result) throw error(404, 'Recipe not found')

  return result
}
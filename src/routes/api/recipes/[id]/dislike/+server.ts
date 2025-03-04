import { error, json } from '@sveltejs/kit'
import { getRecipeById } from '$lib/server/db/recipe'
import { toggleRecipeDislike } from '$lib/server/db/dislike'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) throw error(401, 'Unauthorized')

	const recipeId = params.id

	// Get current recipe
	const existingRecipe = await getRecipeById(recipeId)
	if (!existingRecipe) {
		throw error(404, 'Recipe not found')
	}

	// Toggle dislike status
	const disliked = await toggleRecipeDislike(recipeId, locals.user.id)
	return json({ disliked })
} 
import { error, json } from '@sveltejs/kit'
import { getRecipeById } from '$lib/server/db/recipe'
import { toggleRecipeLike } from '$lib/server/db/like'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) throw error(401, 'Unauthorized')

	const recipeId = params.id

	// Get current recipe
	const existingRecipe = await getRecipeById(recipeId)
	if (!existingRecipe) {
		throw error(404, 'Recipe not found')
	}

	// Toggle like status
	const liked = await toggleRecipeLike(recipeId, locals.user.id)
	return json({ liked })
} 
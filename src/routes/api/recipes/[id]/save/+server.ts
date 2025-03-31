import { error, json } from '@sveltejs/kit'
import { getRecipeById } from '$lib/server/db/recipe'
import { toggleRecipeSave } from '$lib/server/db/save'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) throw error(401, 'Unauthorized')

	const recipeId = params.id

	// Get current recipe
	const existingRecipe = await getRecipeById(recipeId)
	if (!existingRecipe) {
		throw error(404, 'Recipe not found')
	}

	// Toggle save status
	const saved = await toggleRecipeSave(recipeId, locals.user.id)
	return json({ saved })
} 
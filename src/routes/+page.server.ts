import { getRecipes, type RecipeFilter } from '$lib/server/db/recipe'
import { toHomePageRecipe } from '$lib/utils/recipe'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ url }) => {
	const limit = parseInt(url.searchParams.get('limit') || '10', 10)
	const offset = parseInt(url.searchParams.get('offset') || '0', 10)

	const filters: RecipeFilter = {
		detailed: true,
		limit,
		offset
	}

	const recipes = await getRecipes(filters)

	const transformedRecipes = recipes
		.map(toHomePageRecipe)

	return {
		recipes: transformedRecipes
	}
}
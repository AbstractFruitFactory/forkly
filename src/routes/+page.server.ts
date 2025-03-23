import { getRecipes, type RecipeFilter } from '$lib/server/db/recipe'
import { toHomePageRecipe } from '$lib/utils/recipe'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ url }) => {
	const filters: RecipeFilter = {
		detailed: true
	}

	const recipes = await getRecipes(filters)

	const transformedRecipes = recipes
		.map(toHomePageRecipe)

	return {
		recipes: transformedRecipes
	}
}
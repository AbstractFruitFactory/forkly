import { getRecipes, type RecipeFilter } from '$lib/server/db/recipe'
import { toHomePageRecipe } from '$lib/utils/recipe'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async () => {
	const filters: RecipeFilter = {
		detailed: true,
		limit: 18,
		offset: 0
	}

	const recipes = await getRecipes(filters)

	return {
		recipes: recipes.map(toHomePageRecipe)
	}
}
import { getHomePageRecipes } from '$lib/server/db/recipe'
import type { PageServerLoad } from './$types'
import type { DietType } from '$lib/types'

export const load: PageServerLoad = async ({ url }) => {
	const searchQuery = url.searchParams.get('search') || ''

	const dietsParam = url.searchParams.get('diets') || ''
	const diets = dietsParam ? dietsParam.split(',') as DietType[] : []

	const ingredientsParam = url.searchParams.get('ingredients') || ''
	const ingredients = ingredientsParam ? ingredientsParam.split(',') : []

	const recipes = await getHomePageRecipes(searchQuery, diets, ingredients)

	return {
		recipes,
		searchQuery,
		filters: {
			diets,
			ingredients
		}
	}
}
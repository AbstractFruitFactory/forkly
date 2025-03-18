import { getHomePageRecipes } from '$lib/server/db/recipe'
import type { PageServerLoad } from './$types'
import type { DietType } from '$lib/types'

export const load: PageServerLoad = async ({ url }) => {
	const [searchQuery, dietsParam, ingredientsParam] = ['search', 'diets', 'ingredients'].map(url.searchParams.get)

	const diets = dietsParam ? dietsParam.split(',') as DietType[] : []
	const ingredients = ingredientsParam ? ingredientsParam.split(',') : []

	const recipes = await getHomePageRecipes(diets, ingredients, searchQuery)

	const transformedRecipes = recipes
		.map((recipe) => ({
			...recipe,
			ingredients: recipe.ingredients.length,
			instructions: recipe.instructions.length,
			imageUrl: recipe.imageUrl,
			createdAt: recipe.createdAt.toISOString(),
			user: recipe.user?.username
				? {
					username: recipe.user.username,
					avatarUrl: recipe.user.avatarUrl
				}
				: undefined
		}))

	return {
		recipes: transformedRecipes,
		searchQuery: searchQuery || undefined,
		filters: {
			diets,
			ingredients
		}
	}
}
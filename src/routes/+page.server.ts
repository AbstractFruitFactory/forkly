import { safeFetch } from '$lib/utils/fetch'
import { toHomePageRecipe } from '$lib/utils/recipe'
import { error } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import type { RecipesSearchResponse } from './(pages)/api/recipes/search/+server'
import type { SearchCookie } from '$lib/utils/cookies'

export const load: PageServerLoad = async ({ url, fetch, cookies }) => {
	const search = JSON.parse(cookies.get('search') as string | undefined ?? '{}') as SearchCookie | undefined

	const searchParams = new URLSearchParams()
	if (search?.query) searchParams.set('q', search.query)
	if (search?.tags?.length && search.tags.length > 0) searchParams.set('tags', search.tags.join(','))
	if (search?.ingredients?.length && search.ingredients.length > 0) searchParams.set('ingredients', search.ingredients.join(','))
	if (search?.excludedIngredients?.length && search.excludedIngredients.length > 0) searchParams.set('excludedIngredients', search.excludedIngredients.join(','))
	if (search?.sort) searchParams.set('sort', search.sort)

	const recipes = (await safeFetch<RecipesSearchResponse>(fetch)('/api/recipes/search?' + searchParams.toString()))

	if (recipes.isErr()) {
		console.log(recipes.error)
		throw error(500, 'Failed to fetch recipes')
	}

	return {
		recipes: recipes.value.results.map(toHomePageRecipe),
		initialState: {	
			search: search?.query || '',
			tags: search?.tags || [],
			ingredients: search?.ingredients || [],
			excludedIngredients: search?.excludedIngredients || [],
			sort: search?.sort || 'popular'
		}
	}
}
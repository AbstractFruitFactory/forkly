import { safeFetch } from '$lib/utils/fetch'
import { toHomePageRecipe } from '$lib/utils/recipe'
import { error } from '@sveltejs/kit'
import type { PageLoad } from './$types'
import type { RecipesSearchResponse } from './api/recipes/search/+server'

export const load: PageLoad = async ({ url, fetch }) => {
	const searchParams = new URLSearchParams()
	
	const q = url.searchParams.get('q')
	const page = url.searchParams.get('page')
	const limit = url.searchParams.get('limit')
	const tags = url.searchParams.get('tags')
	const ingredients = url.searchParams.get('ingredients')
	const excludedIngredients = url.searchParams.get('excludedIngredients')
	const sort = url.searchParams.get('sort')
	
	if (q) searchParams.set('q', q)
	if (page) searchParams.set('page', page)
	if (limit) searchParams.set('limit', limit)
	if (tags) searchParams.set('tags', tags)
	if (ingredients) searchParams.set('ingredients', ingredients)
	if (excludedIngredients) searchParams.set('excludedIngredients', excludedIngredients)
	if (sort) searchParams.set('sort', sort)

	const recipes = (await safeFetch<RecipesSearchResponse>(fetch)('/api/recipes/search?' + searchParams.toString()))

	if (recipes.isErr()) {
		console.log(recipes.error)
		throw error(500, 'Failed to fetch recipes')
	}

	return {
		recipes: recipes.value.results.map(toHomePageRecipe),
		initialState: {
			search: q || '',
			tags: tags ? tags.split(',').filter(Boolean) : [],
			ingredients: ingredients ? ingredients.split(',').filter(Boolean) : [],
			excludedIngredients: excludedIngredients ? excludedIngredients.split(',').filter(Boolean) : [],
			sort: (sort as 'popular' | 'newest' | 'easiest') || 'popular'
		}
	}
}
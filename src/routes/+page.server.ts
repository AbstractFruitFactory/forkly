import { safeFetch } from '$lib/utils/fetch'
import { error } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import type { RecipesSearchResponse } from './(api)/recipes/search/+server'
import type { PaginationCookie, SearchCookie } from '$lib/utils/cookies'
import type { DetailedRecipe } from '$lib/server/db/recipe'

const PAGINATION_LIMIT = 18

export const load: PageServerLoad = async ({ fetch, cookies, request, isDataRequest }) => {
	const search = JSON.parse(cookies.get('search') as string | undefined ?? '{}') as SearchCookie | undefined
	const { page } = JSON.parse(cookies.get('pagination') as string | undefined ?? '{}') as PaginationCookie

	cookies.delete('pagination', { path: '/' })

	const searchParams = new URLSearchParams()
	if (search?.query) searchParams.set('q', search.query)
	if (search?.tags?.length && search.tags.length > 0) searchParams.set('tags', search.tags.join(','))
	if (search?.ingredients?.length && search.ingredients.length > 0) searchParams.set('ingredients', search.ingredients.join(','))
	if (search?.excludedIngredients?.length && search.excludedIngredients.length > 0) searchParams.set('excludedIngredients', search.excludedIngredients.join(','))
	if (search?.sort) searchParams.set('sort', search.sort)

	const queryString = searchParams.toString()

	const resultPromise = safeFetch<RecipesSearchResponse>(fetch)(
		'/recipes/search?' + queryString + '&page=' + page
	)

	const recipesPromise = resultPromise.then((recipes) => {
		if (recipes.isErr()) {
			console.log(recipes.error)
			throw error(500, 'Failed to fetch recipes')
		}

		return recipes.value.results
	})

	const userAgent = request.headers.get('user-agent') ?? ''
	const isMobile = /Mobile|Android|iPhone|iPod/i.test(userAgent)

	let priorityRecipe: DetailedRecipe | null = null
	if (isMobile && !isDataRequest && !page) {
		const priorityResult = await safeFetch<RecipesSearchResponse>(fetch)(
			'/recipes/search?' + queryString + '&page=0&limit=1'
		)
		if (priorityResult.isOk()) {
			priorityRecipe = priorityResult.value.results[0] ?? null
		}
	}

	return {
		hasMore: recipesPromise.then((r) => r.length === PAGINATION_LIMIT),
		loadedPage: !!page,
		recipes: recipesPromise,
		priorityRecipe,
		initialState: {
                        search: search?.query || '',
                        tags: search?.tags || [],
                        ingredients: search?.ingredients || [],
                        excludedIngredients: search?.excludedIngredients || [],
                        sort: search?.sort || 'popular'
                }
        }
}
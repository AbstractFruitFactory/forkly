<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation'
	import Recipe from '$lib/pages/recipe/Recipe.svelte'
	import { unitPreferenceStore, type UnitSystem } from '$lib/state/unitPreference.svelte'
	import { page } from '$app/state'
	import { safeFetch } from '$lib/utils/fetch.js'
	import type { RecipesLikeResponse } from '../../../api/recipes/like/+server.js'
	import type { RecipesSaveResponse } from '../../../api/recipes/save/+server.js'
	import type { CollectionsResponse } from '../../../api/collections/+server.js'
	import type { CommentsResponse } from '../../../api/recipes/[id]/comments/+server.js'
	import { errorStore } from '../../../+layout.svelte'

	let { data } = $props()

	$effect(() => {
		data.recipe.then((r) => {
			if (!r) {
				errorStore.setError(404, 'Recipe not found')
			}
		})
	})

	const COMMENTS_PER_PAGE = 10
	let comments = $state(data.comments)
	let currentPage = $state(parseInt(page.url.searchParams.get('page') || '0', 10))
	let hasMore = $state(false)

	$effect(() => {
		data.comments.then((c) => {
			hasMore = c.comments.length === COMMENTS_PER_PAGE
		})
	})

	const handleLike = async () => {
		await safeFetch<RecipesLikeResponse>()(`/api/recipes/like`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ id: (await data.recipe).id })
		})
	}

	const handleSave = async (collectionName?: string) => {
		await safeFetch<RecipesSaveResponse>()(`/api/recipes/save`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ id: (await data.recipe).id, collectionName })
		})
	}

	const createCollection = async (name: string) => {
		await safeFetch<CollectionsResponse>()(`/api/collections`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ name })
		})
	}

	const handleUnitChange = (system: UnitSystem) => {
		if (system === 'metric') {
			unitPreferenceStore.setMetric()
		} else {
			unitPreferenceStore.setImperial()
		}
	}

	const loadComments = async (pageNum: number) => {
		const result = await safeFetch<CommentsResponse>()(
			`/api/recipes/${(await data.recipe).id}/comments?page=${pageNum}`
		)
		if (result.isOk()) {
			comments = Promise.resolve(result.value)
			hasMore = result.value.comments.length === COMMENTS_PER_PAGE
			currentPage = pageNum
		}
	}

	const nextPage = async () => {
		if (!hasMore) return
		await loadComments(currentPage + 1)
	}

	const prevPage = async () => {
		if (currentPage === 0) return
		await loadComments(currentPage - 1)
	}

	const handleCommentAdded = async () => {
		await loadComments(0)
	}

	const unitSystem = $derived(unitPreferenceStore.unitSystem)
</script>

<div class="recipe-page" data-page="recipe">
	<Recipe
		recipe={data.recipe}
		nutritionInfo={{
			totalNutrition: data.recipe.nutrition,
			hasCustomIngredients: false
		}}
		{unitSystem}
		onUnitChange={handleUnitChange}
		onLike={handleLike}
		onSave={handleSave}
		onBackClick={() => goto('/')}
		onCreateCollection={createCollection}
		isLoggedIn={!!data.user}
		collections={data.collections.then((c) => c.map((c) => c.name))}
		recipeComments={comments}
		formError={page.form?.error}
		onCommentAdded={handleCommentAdded}
		page={currentPage}
		{hasMore}
		onNextPage={nextPage}
		onPrevPage={prevPage}
	/>
</div>

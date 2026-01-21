<script lang="ts">
	import { goto } from '$app/navigation'
	import Recipe from '$lib/pages/recipe/Recipe.svelte'
	import { unitPreferenceStore, type UnitSystem } from '$lib/state/unitPreference.svelte'
	import { page } from '$app/state'
	import { safeFetch } from '$lib/utils/fetch.js'
	import type { RecipesLikeResponse } from '../../../(api)/recipes/like/+server.js'
	import type { RecipesSaveResponse } from '../../../(api)/recipes/save/+server.js'
	import type { CollectionsResponse } from '../../../(api)/collections/+server.js'
	import type { CommentsResponse } from '../../../(api)/recipes/[id]/comments/+server.js'
	import { errorStore } from '../../../+layout.svelte'
	import { getRecipeData } from './data.remote'
	import type { PageProps } from './$types'

	let {
		params,
		data,
		preview = false
	}: {
		params: {
			id: string
		}
		preview?: boolean
	} & Partial<PageProps> = $props()

	const currentUrl = $derived(page.url.href)
	let resolvedRecipeData = $state(data?.recipeData ?? undefined)
	let loading = $derived(!resolvedRecipeData)
	let recipePromise = $state<ReturnType<typeof getRecipeData> | undefined>(undefined)
	let lastRecipeId = $state<string | undefined>(params.id)

	$effect(() => {
		if (lastRecipeId !== params.id) {
			lastRecipeId = params.id
			resolvedRecipeData = undefined
		}
		if (resolvedRecipeData || !params.id) return
		const promise = getRecipeData({ id: params.id })
		recipePromise = promise
		promise.then((result) => {
			if (recipePromise !== promise) return
			resolvedRecipeData = result
		})
	})

	const getRecipe = async () => {
		if (resolvedRecipeData?.recipe) return resolvedRecipeData.recipe
		if (recipePromise) {
			const resolvedData = await recipePromise
			return resolvedData.recipe
		}
		return undefined
	}

	$effect(() => {
		getRecipe().then((r) => {
			if (!r) {
				errorStore.setError(404, 'Recipe not found')
			}
		})
	})

	const handleLike = async () => {
		const recipe = await getRecipe()
		if (!recipe) return
		await safeFetch<RecipesLikeResponse>()(`/recipes/like`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ id: recipe.id })
		})
	}

	const handleSave = async (collectionName?: string) => {
		const recipe = await getRecipe()
		if (!recipe) return
		await safeFetch<RecipesSaveResponse>()(`/recipes/save`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ id: recipe.id, collectionName })
		})
	}

	const createCollection = async (name: string) => {
		await safeFetch<CollectionsResponse>()(`/collections`, {
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
		const recipe = await getRecipe()
		if (!recipe) {
			throw new Error('Recipe not found')
		}
		const result = await safeFetch<CommentsResponse>()(
			`/recipes/${recipe.id}/comments?page=${pageNum}`
		)
		if (result.isOk()) {
			return result.value
		}
		throw new Error('Failed to load comments')
	}

	const unitSystem = $derived(data?.unitPreference ?? unitPreferenceStore.value)

	$effect(() => {
		if (!data?.unitPreference) return
		if (data.unitPreference === 'metric') {
			unitPreferenceStore.setMetric()
		} else {
			unitPreferenceStore.setImperial()
		}
	})
</script>

<svelte:head>
	<meta property="og:type" content="article" />
	<meta property="og:title" content={data?.recipeData?.recipe?.title} />
	<meta property="og:description" content={data?.recipeData?.recipe?.description} />
	<meta property="og:image" content={data?.recipeData?.recipe?.imageUrl} />
	<meta property="og:url" content={currentUrl} />
</svelte:head>

<div class="recipe-page" data-page="recipe">
	<Recipe
		{preview}
		recipeData={resolvedRecipeData}
		{loading}
		{unitSystem}
		onUnitChange={handleUnitChange}
		onLike={handleLike}
		onSave={handleSave}
		onBackClick={() => goto('/')}
		onCreateCollection={createCollection}
		formError={page.form?.error}
		{loadComments}
	/>
</div>

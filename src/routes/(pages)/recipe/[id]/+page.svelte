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

	let { params, form } = $props()

	const currentUrl = $derived(page.url.href)
	const recipeData = $derived(getRecipeData({ id: params.id }))

	const getRecipe = async () => {
		const resolvedData = await recipeData
		return resolvedData.recipe instanceof Promise ? await resolvedData.recipe : resolvedData.recipe
	}

	const getCollections = async () => {
		const resolvedData = await recipeData
		return resolvedData.collections instanceof Promise
			? await resolvedData.collections
			: resolvedData.collections
	}

	const getComments = async () => {
		const resolvedData = await recipeData
		return resolvedData.comments instanceof Promise
			? await resolvedData.comments
			: resolvedData.comments
	}

	const getIsLoggedIn = async () => {
		const resolvedData = await recipeData
		return resolvedData.isLoggedIn
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
		const result = await safeFetch<CommentsResponse>()(
			`/recipes/${recipe.id}/comments?page=${pageNum}`
		)
		if (result.isOk()) {
			return result.value
		}
		throw new Error('Failed to load comments')
	}

	const unitSystem = $derived(unitPreferenceStore.unitSystem)
</script>

<svelte:head>
	{#await getRecipe()}
		<!-- Loading state for meta tags -->
	{:then recipe}
		<meta property="og:type" content="article" />
		<meta property="og:title" content={recipe.title} />
		<meta property="og:description" content={recipe.description} />
		<meta property="og:image" content={recipe.imageUrl} />
		<meta property="og:url" content={currentUrl} />
	{/await}
</svelte:head>

<div class="recipe-page" data-page="recipe">
	<Recipe
		{recipeData}
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

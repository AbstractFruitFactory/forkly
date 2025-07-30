<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation'
	import Recipe from '$lib/pages/recipe/Recipe.svelte'
	import { unitPreferenceStore, type UnitSystem } from '$lib/state/unitPreference.svelte'
	import { page } from '$app/state'
	import { safeFetch } from '$lib/utils/fetch.js'
	import type { RecipesLikeResponse } from '../../../(api)/recipes/like/+server.js'
	import type { RecipesSaveResponse } from '../../../(api)/recipes/save/+server.js'
	import type { CollectionsResponse } from '../../../(api)/collections/+server.js'
	import type { CommentsResponse } from '../../../(api)/recipes/[id]/comments/+server.js'
	import { errorStore } from '../../../+layout.svelte'

	let { data } = $props()

	const currentUrl = $derived(page.url.href)

	const getRecipe = async () => {
		return data.recipe instanceof Promise ? await data.recipe : data.recipe
	}

	const getCollections = async () => {
		return data.collections instanceof Promise ? await data.collections : data.collections
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
	<meta property="og:type" content="article" />
	<meta property="og:title" content={(data.recipe as any).title} />

	<meta property="og:description" content={(data.recipe as any).description} />

	<meta property="og:image" content={(data.recipe as any).imageUrl} />

	<meta property="og:url" content={currentUrl} />
</svelte:head>

<div class="recipe-page" data-page="recipe">
	<Recipe
		recipe={Promise.resolve(getRecipe())}
		{unitSystem}
		onUnitChange={handleUnitChange}
		onLike={handleLike}
		onSave={handleSave}
		onBackClick={() => goto('/')}
		onCreateCollection={createCollection}
		isLoggedIn={!!data.user}
		collections={getCollections().then((c) => c.map((c) => c.name))}
		recipeComments={data.comments}
		formError={page.form?.error}
		{loadComments}
	/>
</div>

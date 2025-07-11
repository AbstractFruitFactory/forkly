<script lang="ts">
	import { goto } from '$app/navigation'
	import Recipe from '$lib/pages/recipe/Recipe.svelte'
	import { unitPreferenceStore, type UnitSystem } from '$lib/state/unitPreference.svelte'
	import { page } from '$app/state'
	import { safeFetch } from '$lib/utils/fetch.js'
	import type { RecipesLikeResponse } from '../../../api/recipes/like/+server.js'
	import type { RecipesSaveResponse } from '../../../api/recipes/save/+server.js'
	import type { CollectionsResponse } from '../../../api/collections/+server.js'

	let { data } = $props()

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

	const unitSystem = $derived(unitPreferenceStore.unitSystem)
</script>

<div class="recipe-page" data-page="recipe">
	{#await data.recipe then recipe}
		<Recipe
			recipe={Promise.resolve(recipe)}
			nutritionInfo={{
				totalNutrition: recipe.nutrition,
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
			recipeComments={data.comments}
			commentPage={data.commentsPage}
			commentsHasMore={data.commentsHasMore}
			onCommentPageChange={(p) => goto(`?page=${p}`)}
			formError={page.form?.error}
		/>
	{:catch error}
		<p>Error loading recipe: {error.message}</p>
	{/await}
</div>

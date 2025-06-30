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
			body: JSON.stringify({ id: data.id })
		})
	}

	const handleSave = async (collectionName?: string) => {
		await safeFetch<RecipesSaveResponse>()(`/api/recipes/save`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ id: data.id, collectionName })
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
		user={data.user}
		recipeComments={data.comments}
		formError={page.form?.error}
	/>
</div>

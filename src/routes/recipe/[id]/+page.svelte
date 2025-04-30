<script lang="ts">
	import { goto } from '$app/navigation'
	import Recipe from '$lib/pages/recipe/Recipe.svelte'
	import { unitPreferenceStore, type UnitSystem } from '$lib/state/unitPreference.svelte'
	import { page } from '$app/state'
	import { safeFetch } from '$lib/utils/fetch.js'
	import type { RecipesLikeResponse } from '../../api/recipes/like/+server.js'
	import type { RecipesDislikeResponse } from '../../api/recipes/dislike/+server.js'
	import type { RecipesSaveResponse } from '../../api/recipes/save/+server.js'
	import type { RecipeData } from '$lib/types'

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

	const handleDislike = async () => {
		await safeFetch<RecipesDislikeResponse>()(`/api/recipes/dislike`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ id: data.id })
		})
	}

	const handleSave = async () => {
		await safeFetch<RecipesSaveResponse>()(`/api/recipes/save`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ id: data.id })
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

	// Ensure createdAt is a string
	const createdAtStr =
		typeof data.createdAt === 'string'
			? data.createdAt
			: data.createdAt instanceof Date
				? data.createdAt.toISOString()
				: new Date().toISOString()

	const recipeData: RecipeData = {
		...data,
		createdAt: createdAtStr,
		ingredients: data.ingredients,
		user: data.user
			? {
					username: data.user.username,
					avatarUrl: data.user.avatarUrl || undefined
				}
			: undefined
	}
</script>

<div class="recipe-page" data-page="recipe">
	<Recipe
		recipe={recipeData}
		nutrition={{
			totalNutrition: data.nutrition,
			hasCustomIngredients: false
		}}
		{unitSystem}
		onUnitChange={handleUnitChange}
		onLike={handleLike}
		onDislike={handleDislike}
		onSave={handleSave}
		onBackClick={() => goto('/')}
		isLoggedIn={!!data.user}
		comments={data.comments}
		formError={page.form?.error}
	/>
</div>

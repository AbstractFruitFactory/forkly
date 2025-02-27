<script lang="ts">
	import Recipe from '$lib/pages/recipe/Recipe.svelte'
	import { unitPreferenceStore, type UnitSystem } from '$lib/state/unitPreference.svelte'

	let { data } = $props()

	const handleLike = async () => {
		const response = await fetch(`/api/recipes/${data.recipe.id}/like`, {
			method: 'POST'
		})

		if (response.ok) {
			isLiked = !isLiked
			likes = isLiked ? likes + 1 : likes - 1
		}
	}

	let isLiked = $state(data.recipe.isLiked)
	let likes = $state(data.recipe.likes)

	const handleUnitChange = (system: UnitSystem) => {
		if (system === 'metric') {
			unitPreferenceStore.setMetric()
		} else {
			unitPreferenceStore.setImperial()
		}
	}

	// Get the current unit system as a derived value
	const unitSystem = $derived(unitPreferenceStore.unitSystem)
</script>

<Recipe
	recipe={{
		...data.recipe,
		likes,
		isLiked
	}}
	nutrition={{
		totalNutrition: {
			calories: data.nutrition.calories,
			protein: data.nutrition.protein,
			carbs: data.nutrition.carbs,
			fat: data.nutrition.fat
		},
		hasCustomIngredients: false
	}}
	onLike={handleLike}
	{unitSystem}
	onUnitChange={handleUnitChange}
/>

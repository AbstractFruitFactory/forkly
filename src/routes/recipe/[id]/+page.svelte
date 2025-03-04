<script lang="ts">
	import Recipe from '$lib/pages/recipe/Recipe.svelte'
	import { unitPreferenceStore, type UnitSystem } from '$lib/state/unitPreference.svelte'

	let { data } = $props()

	const handleLike = async () => {
		const response = await fetch(`/api/recipes/like`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ id: data.recipe.id })
		})

		if (response.ok) {
			isLiked = !isLiked
			likes = isLiked ? likes + 1 : likes - 1
		}
	}

	const handleBookmark = async () => {
		const response = await fetch(`/api/recipes/bookmark`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ id: data.recipe.id })
		})

		if (response.ok) {
			isBookmarked = !isBookmarked
			bookmarks = isBookmarked ? bookmarks + 1 : bookmarks - 1
		}
	}

	let isLiked = $state(data.recipe.isLiked)
	let likes = $state(data.recipe.likes)
	let isBookmarked = $state(data.recipe.isBookmarked)
	let bookmarks = $state(data.recipe.bookmarks)

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
		isLiked,
		bookmarks,
		isBookmarked
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
	onBookmark={handleBookmark}
	{unitSystem}
	onUnitChange={handleUnitChange}
	isLoggedIn={!!data.user}
/>

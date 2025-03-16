<script lang="ts">
	import { goto } from '$app/navigation'
	import Recipe from '$lib/pages/recipe/Recipe.svelte'
	import { unitPreferenceStore, type UnitSystem } from '$lib/state/unitPreference.svelte'
	import type { Ingredient } from '$lib/types'
	import { page } from '$app/state'

	let { data } = $props()

	const handleLike = async () => {
		const response = await fetch(`/api/recipes/like`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ id: data.id })
		})

		if (response.ok) {
			isLiked = !isLiked
			likes = isLiked ? likes + 1 : likes - 1
		}
	}

	const handleDislike = async () => {
		const response = await fetch(`/api/recipes/dislike`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ id: data.id })
		})

		if (response.ok) {
			isDisliked = !isDisliked
		}
	}

	const handleBookmark = async () => {
		const response = await fetch(`/api/recipes/bookmark`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ id: data.id })
		})

		if (response.ok) {
			isBookmarked = !isBookmarked
			bookmarks = isBookmarked ? bookmarks + 1 : bookmarks - 1
		}
	}

	let isLiked = $state(data.isLiked)
	let likes = $state(data.likes)
	let isDisliked = $state(data.isDisliked)
	let isBookmarked = $state(data.isBookmarked)
	let bookmarks = $state(data.bookmarks)

	// Map ingredients to the correct type
	const ingredients = data.ingredients.map(
		(ingredient: any): Ingredient => ({
			...ingredient,
			custom: ingredient.custom ?? false
		})
	)

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
		...data,
		ingredients,
		likes,
		isLiked,
		isDisliked,
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
	onDislike={handleDislike}
	onBookmark={handleBookmark}
	{unitSystem}
	onUnitChange={handleUnitChange}
	isLoggedIn={!!data.user}
	onBackClick={() => goto('/')}
	comments={data.comments}
	formError={page.form?.error}
/>

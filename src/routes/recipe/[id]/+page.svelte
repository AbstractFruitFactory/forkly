<script lang="ts">
	import { goto } from '$app/navigation'
	import Recipe from '$lib/pages/recipe/Recipe.svelte'
	import { unitPreferenceStore, type UnitSystem } from '$lib/state/unitPreference.svelte'
	import { page } from '$app/state'
	import { safeFetch } from '$lib/utils/fetch.js'
	import type { RecipesLikeResponse } from '../../api/recipes/like/+server.js'
	import type { RecipesDislikeResponse } from '../../api/recipes/dislike/+server.js'
	import type { RecipesBookmarkResponse } from '../../api/recipes/bookmark/+server.js'

	let { data } = $props()

	const handleLike = async () => {
		const response = await safeFetch<RecipesLikeResponse>()(`/api/recipes/like`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ id: data.id })
		})

		if (response.isOk()) {
			isLiked = !isLiked
			likes = isLiked ? likes + 1 : likes - 1
		}
	}

	const handleDislike = async () => {
		const response = await safeFetch<RecipesDislikeResponse>()(`/api/recipes/dislike`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ id: data.id })
		})

		if (response.isOk()) {
			isDisliked = !isDisliked
		}
	}

	const handleBookmark = async () => {
		const response = await safeFetch<RecipesBookmarkResponse>()(`/api/recipes/bookmark`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ id: data.id })
		})

		if (response.isOk()) {
			isBookmarked = !isBookmarked
			bookmarks = isBookmarked ? bookmarks + 1 : bookmarks - 1
		}
	}

	let isLiked = $state(data.isLiked)
	let likes = $state(data.likes)
	let isDisliked = $state(data.isDisliked)
	let isBookmarked = $state(data.isBookmarked)
	let bookmarks = $state(data.bookmarks)

	const ingredients = data.ingredients.map((ingredient) => ({
		...ingredient,
		custom: ingredient.custom
	}))

	const handleUnitChange = (system: UnitSystem) => {
		if (system === 'metric') {
			unitPreferenceStore.setMetric()
		} else {
			unitPreferenceStore.setImperial()
		}
	}

	const unitSystem = $derived(unitPreferenceStore.unitSystem)
</script>

<svelte:head>
	<style lang="scss">
		@import '$lib/global.scss';

		@include mobile {
			.header {
				display: none !important;
			}
		}
	</style>
</svelte:head>

<div class="recipe-page" data-page="recipe">
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
</div>

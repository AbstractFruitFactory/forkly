<script lang="ts">
	import type { NutritionInfo } from '$lib/server/food-api'
	import type { UnitSystem } from '$lib/state/unitPreference.svelte'
	import type { RecipeData } from '$lib/types'
	import RecipeDesktopView from './RecipeDesktopView.svelte'
	import RecipeMobileView from './RecipeMobileView.svelte'
	import { getFormattedIngredient } from './utils/recipeUtils'
	import { onMount } from 'svelte'

	let {
		recipe,
		nutrition,
		onLike,
		onDislike,
		unitSystem,
		onUnitChange,
		isLoggedIn,
		onBookmark,
		onBackClick
	}: {
		recipe: RecipeData
		nutrition: {
			totalNutrition: Omit<NutritionInfo, 'servingSize'>
			hasCustomIngredients: boolean
		}
		onLike?: () => void
		onDislike?: () => void
		unitSystem: UnitSystem
		onUnitChange: (system: UnitSystem) => void
		isLoggedIn: boolean
		onBookmark?: () => void
		onBackClick?: () => void
	} = $props()

	type CommentType = {
		id: string
		content: string
		createdAt: string | Date
		user: {
			id: string
			username: string
			avatarUrl: string | null
		}
	}

	let comments = $state<CommentType[]>([])
	let isLoadingComments = $state(false)

	onMount(async () => {
		await fetchComments()
	})

	async function fetchComments() {
		isLoadingComments = true
		try {
			const response = await fetch(`/api/recipes/${recipe.id}/comments`)
			if (response.ok) {
				comments = await response.json()
			}
		} catch (error) {
			console.error('Error fetching comments:', error)
		} finally {
			isLoadingComments = false
		}
	}

	async function handleAddComment(content: string) {
		try {
			const response = await fetch(`/api/recipes/${recipe.id}/comments`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ content })
			})

			if (response.ok) {
				const newComment = await response.json()
				comments = [newComment, ...comments]
				return Promise.resolve()
			} else {
				return Promise.reject(new Error('Failed to add comment'))
			}
		} catch (error) {
			console.error('Error adding comment:', error)
			return Promise.reject(error)
		}
	}
</script>

<RecipeDesktopView
	{recipe}
	{nutrition}
	{onLike}
	{onDislike}
	{unitSystem}
	{onUnitChange}
	{isLoggedIn}
	{onBookmark}
	{getFormattedIngredient}
	comments={comments as any}
	onAddComment={handleAddComment}
/>

<RecipeMobileView
	{recipe}
	{nutrition}
	{getFormattedIngredient}
	{unitSystem}
	{onUnitChange}
	{isLoggedIn}
	{onBookmark}
	{onBackClick}
	comments={comments as any}
	onAddComment={handleAddComment}
/>

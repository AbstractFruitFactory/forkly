<script lang="ts">
	import RecipeSuccess from '$lib/pages/recipe-created/RecipeCreated.svelte'
	import NewRecipe from '$lib/pages/new-recipe/NewRecipe.svelte'
	import type { IngredientSearchResult } from '$lib/server/food-api'
	import { trpc } from '$lib/trpc/client'
	import { page } from '$app/state'

	let { form } = $props()

	let searchTimeout: ReturnType<typeof setTimeout>

	const handleSearchIngredients = async (query: string): Promise<IngredientSearchResult> => {
		clearTimeout(searchTimeout)

		return new Promise((resolve) => {
			searchTimeout = setTimeout(async () => {
				const result = await trpc(page).ingredients.search.query(query)

				if (result.isOk()) {
					resolve(result.value)
				} else {
					console.error('Failed to fetch ingredients:', result.error)
					resolve([])
				}
			}, 300)
		})
	}

	const handleIngredientSelect = async (ingredient: IngredientSearchResult[0]) => {
		await trpc(page).ingredients.cacheSelected.mutate({
			name: ingredient.name,
			id: ingredient.id
		})
	}
</script>

{#if form?.success}
	<RecipeSuccess recipeId={form.recipeId} />
{:else}
	<NewRecipe
		errors={form?.errors}
		onSearchIngredients={handleSearchIngredients}
		onIngredientSelect={handleIngredientSelect}
	/>
{/if}

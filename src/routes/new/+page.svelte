<script lang="ts">
	import { page } from '$app/state'
	import RecipeSuccess from '$lib/pages/recipe-created/RecipeCreated.svelte'
	import NewRecipePage from '$lib/pages/new-recipe/NewRecipe.svelte'
	import type { IngredientSearchResult } from '$lib/server/food-api'
	import { trpc } from '$lib/trpc/client'

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
</script>

{#if form && form.success}
	<RecipeSuccess recipeId={form.recipeId} />
{:else}
	<NewRecipePage errors={form?.errors} onSearchIngredients={handleSearchIngredients} />
{/if}

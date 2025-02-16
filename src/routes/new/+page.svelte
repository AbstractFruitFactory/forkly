<script lang="ts">
	import { page } from '$app/state'
	import NewRecipePage from '$lib/pages/new-recipe/NewRecipe.svelte'
	import type { IngredientSearchResult } from '$lib/server/food-api'
	import { trpc } from '$lib/trpc/client'

	let { errors } = $props()

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

<NewRecipePage {errors} onSearchIngredients={handleSearchIngredients} />

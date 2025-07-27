<script lang="ts">
	import Popup from '$lib/components/popup/Popup.svelte'
	import RecipeScraper from './RecipeScraper.svelte'
	import type { RecipeData } from '../../pages/new-recipe/NewRecipe.svelte'

	let {
		isOpen = $bindable(false),
		onClose,
		onRecipeScraped
	}: {
		isOpen?: boolean
		onClose?: () => void
		onRecipeScraped?: (recipe: RecipeData) => void
	} = $props()

	function handleClose() {
		isOpen = false
		onClose?.()
	}
</script>

<Popup bind:isOpen title="Import Recipe" width="800px" {onClose}>
	<div class="import-recipe-content">
		<RecipeScraper onClose={handleClose} {onRecipeScraped} />
	</div>
</Popup>

<style lang="scss">
	@import '$lib/global.scss';

	.import-recipe-content {
		max-height: 70vh;
		overflow-y: auto;
		padding: var(--spacing-lg);
	}
</style>

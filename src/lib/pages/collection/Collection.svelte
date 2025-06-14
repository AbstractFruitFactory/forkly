<script lang="ts">
	import RecipeGrid from '$lib/components/recipe-grid/RecipeGrid.svelte'
	import type { DetailedRecipe } from '$lib/server/db/recipe'
	import { fly } from 'svelte/transition'
	import ArrowLeftIcon from 'lucide-svelte/icons/arrow-left'

	let { name, recipes }: { name: string; recipes: DetailedRecipe[] } = $props()
</script>

<div in:fly={{ x: -50, duration: 300, delay: 500 }} out:fly={{ x: -50, duration: 300 }}>
	<a class="back-button" href="/profile?tab=Saved recipes">
		<ArrowLeftIcon size={18} />
		<span>Back to saved recipes</span>
	</a>

	<h1>{name}</h1>

	<RecipeGrid {recipes} useAnimation={false} />
</div>

<style lang="scss">
	.back-button {
		display: flex;
		align-items: center;
		gap: var(--spacing-xs);
		background: none;
		border: none;
		color: var(--color-neutral);
		cursor: pointer;
		padding: var(--spacing-xs) 0;
		margin-bottom: var(--spacing-md);
		font-size: var(--font-size-sm);
		transition: color var(--transition-fast) var(--ease-in-out);
	}
</style>

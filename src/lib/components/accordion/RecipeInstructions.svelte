<script lang="ts">
	import RecipeInstruction from './RecipeInstruction.svelte'
	import type { RecipeData } from '$lib/types'

	let { instructions }: { instructions: RecipeData['instructions'] } = $props()
</script>

<div class="instructions-list">
	{#each instructions as instruction, i}
		<RecipeInstruction {instruction} index={i} />
	{/each}
</div>

<style lang="scss">
	@import '$lib/global.scss';

	.instructions-list {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
	}
</style>

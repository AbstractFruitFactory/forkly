<script lang="ts">
	import type { IngredientSearchResult } from '$lib/server/food-api'
	import type { Snippet } from 'svelte'

	let {
		isLoading = false,
		suggestions = [] as IngredientSearchResult,
		children,
		onSelect
	}: {
		isLoading?: boolean
		suggestions?: IngredientSearchResult
		children: Snippet
		onSelect: (suggestion: IngredientSearchResult[number]) => void
	} = $props()
</script>

<div class="autocomplete-wrapper">
	{@render children()}

	{#if isLoading}
		<div class="loading-indicator">Loading...</div>
	{/if}

	{#if suggestions?.length > 0}
		<ul class="suggestions-list">
			{#each suggestions as suggestion}
				<li>
					<button type="button" onclick={() => onSelect(suggestion)}>
						{suggestion.name}
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style lang="scss">
	.autocomplete-wrapper {
		position: relative;
		width: 100%;
	}

	.loading-indicator {
		position: absolute;
		right: 8px;
		top: 50%;
		transform: translateY(-50%);
		font-size: 14px;
		color: var(--color-neutral);
	}

	.suggestions-list {
		position: absolute;
		top: 100%;
		left: 0;
		right: 0;
		margin: 0;
		padding: 0;
		list-style: none;
		background: var(--color-neutral-lighter);
		border: 1px solid var(--color-neutral);
		border-radius: 4px;
		box-shadow: var(--shadow-md);
		z-index: 10;
		max-height: 200px;
		overflow-y: auto;

		li {
			margin: 0;
		}

		button {
			width: 100%;
			text-align: left;
			padding: 8px 12px;
			background: none;
			border: none;
			color: var(--color-neutral-dark);
			cursor: pointer;

			&:hover {
				background: var(--color-primary);
			}
		}
	}
</style>

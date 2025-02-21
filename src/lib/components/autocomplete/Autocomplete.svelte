<script lang="ts">
	import type { Snippet } from 'svelte'
	import Input from '../input/Input.svelte'

	type T = $$Generic<{ name: string }>

	let {
		isLoading = false,
		suggestions = [],
		children,
		onSelect
	}: {
		isLoading?: boolean
		suggestions?: T[]
		children: Snippet
		onSelect: (suggestion: T) => void
	} = $props()
</script>

<div class="autocomplete-wrapper">
	<Input>
		{@render children()}
	</Input>

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
		right: var(--spacing-sm);
		top: 50%;
		transform: translateY(-50%);
		font-size: var(--spacing-md);
	}

	.suggestions-list {
		position: absolute;
		top: 100%;
		left: 0;
		right: 0;
		margin: 0;
		padding: 0;
		list-style: none;
		background: var(--color-neutral-dark);
		border: var(--border-width-thin) solid var(--color-neutral);
		border-radius: var(--border-radius-md);
		box-shadow: var(--shadow-md);
		z-index: 10;
		max-height: calc(var(--spacing-2xl) * 4);
		overflow-y: auto;

		li {
			margin: 0;
		}

		button {
			width: 100%;
			text-align: left;
			padding: var(--spacing-sm) var(--spacing-md);
			background: none;
			border: none;
			cursor: pointer;
			font-size: var(--spacing-md);

			&:hover {
				background: var(--color-primary);
			}
		}
	}
</style>

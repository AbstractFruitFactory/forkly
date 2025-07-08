<script lang="ts">
	import { type Snippet } from 'svelte'
	import Dropdown from '../dropdown/Dropdown.svelte'

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

	const handleSelect = (suggestion: T) => {
		onSelect(suggestion)
	}
</script>

<div class="autocomplete-wrapper">
	{@render children()}

	{#if isLoading}
		<div class="loading-indicator" aria-live="polite">
			<svg
				class="spinner"
				viewBox="0 0 24 24"
				xmlns="http://www.w3.org/2000/svg"
				width="16"
				height="16"
				stroke="currentColor"
				fill="none"
			>
				<circle cx="12" cy="12" r="10" stroke-width="2" stroke-opacity="0.3" />
				<path d="M12 2a10 10 0 0 1 10 10" stroke-width="2" stroke-linecap="round">
					<animateTransform
						attributeName="transform"
						type="rotate"
						from="0 12 12"
						to="360 12 12"
						dur="1s"
						repeatCount="indefinite"
					/>
				</path>
			</svg>
			<span class="sr-only">Loading suggestions...</span>
		</div>
	{/if}

	<Dropdown isOpen={suggestions.length > 0}>
		{#snippet dropdownContent(itemContent)}
			{#each suggestions as suggestion, i}
				{#snippet item()}
					{suggestion.name}
				{/snippet}
				{@render itemContent(item, () => handleSelect(suggestion))}
			{/each}
		{/snippet}
	</Dropdown>
</div>

<style lang="scss">
	.autocomplete-wrapper {
		position: relative;
		width: 100%;
	}

	.loading-indicator {
		position: absolute;
		right: var(--spacing-lg);
		top: 50%;
		transform: translateY(-50%);
		color: var(--color-neutral);
		display: flex;
		align-items: center;
		pointer-events: none;
	}

	.spinner {
		animation: spin 1s linear infinite;
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		border: 0;
	}

	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}
</style>

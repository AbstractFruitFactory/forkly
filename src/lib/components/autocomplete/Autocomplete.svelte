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
				<path
					d="M12 2a10 10 0 0 1 10 10"
					stroke-width="2"
					stroke-linecap="round"
				>
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

	{#if suggestions?.length > 0}
		<ul class="suggestions-list" role="listbox">
			{#each suggestions as suggestion, i}
				<li role="option">
					<button
						type="button"
						onclick={() => onSelect(suggestion)}
						class="suggestion-button"
					>
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

	.suggestions-list {
		position: absolute;
		top: calc(100% + var(--spacing-xs));
		left: 0;
		right: 0;
		margin: 0;
		padding: var(--spacing-xs) 0;
		list-style: none;
		background: var(--color-neutral-dark);
		border: var(--border-width-thin) solid var(--color-neutral);
		border-radius: var(--border-radius-md);
		box-shadow: var(--shadow-md);
		z-index: 10;
		max-height: calc(var(--spacing-2xl) * 4);
		overflow-y: auto;
		backdrop-filter: blur(8px);

		&::-webkit-scrollbar {
			width: var(--spacing-xs);
		}

		&::-webkit-scrollbar-track {
			background: transparent;
		}

		&::-webkit-scrollbar-thumb {
			background: var(--color-neutral);
			border-radius: var(--border-radius-sm);
		}

		li {
			margin: 0;
		}
	}

	.suggestion-button {
		width: 100%;
		text-align: left;
		padding: var(--spacing-sm) var(--spacing-md);
		background: none;
		border: none;
		cursor: pointer;
		font-size: var(--font-size-sm);
		color: var(--color-neutral-light);
		transition: all var(--transition-fast) var(--ease-in-out);

		&:hover,
		&:focus-visible {
			background: var(--color-neutral-darker, rgba(255, 255, 255, 0.05));
			color: var(--color-primary);
			outline: none;
		}

		&:focus-visible {
			box-shadow: inset 0 0 0 2px var(--color-primary);
		}
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

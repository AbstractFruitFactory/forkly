<script lang="ts">
	import type { Snippet } from 'svelte'
	import Clear from '../icons/Clear.svelte'

	let {
		children,
		actionButton,
		isLoading,
		value = $bindable(''),
		roundedCorners = false,
		clearButton
	}: {
		children: Snippet
		actionButton?: { text: string; onClick: () => void }
		isLoading?: boolean
		value?: string
		roundedCorners?: boolean
		clearButton?: Snippet
	} = $props()

	const showClear = $derived(value !== '')

	const onClear = () => {
		value = ''
	}
</script>

<div
	class="input-wrapper"
	style:--rounded-corners={roundedCorners ? 'var(--border-radius-full)' : undefined}
>
	<div class="input-container">
		{@render children()}
		<div class="right-elements">
			<button class="clear-button" onclick={onClear} aria-label="Clear input">
				{#if clearButton}
					{@render clearButton()}
				{:else if showClear}
					<Clear color="var(--color-text-on-surface)" />
				{/if}
				{#if isLoading}
					<div class="loading-spinner"></div>
				{/if}
			</button>
			{#if actionButton}
				<button class="action-button" type="button" onclick={actionButton.onClick}>
					{actionButton.text}
				</button>
			{/if}
		</div>
	</div>
</div>

<style lang="scss">
	@mixin input-base {
		width: 100%;
		height: 34px;
		padding: 0 var(--spacing-lg);
		font-family: var(--font-sans);
		font-size: var(--font-size-sm);
		transition: all var(--transition-fast) var(--ease-in-out);

		&::placeholder {
			color: var(--color-neutral-light);
			opacity: 0.5;
		}

		&:focus {
			outline: none;
			border-color: var(--color-primary);
			box-shadow: 0 0 0 var(--border-width-thin) var(--color-primary-light);
		}

		&:disabled {
			opacity: 0.5;
			cursor: not-allowed;
			background-color: var(--color-neutral-darker, var(--color-neutral-dark));
		}
	}

	.input-wrapper {
		display: flex;
		flex-direction: column;
		height: 100%;
		width: 100%;
	}

	.input-container {
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: center;
		border: var(--border-width-thin) solid var(--color-neutral);
		border-radius: var(--rounded-corners, var(--border-radius-lg));
		background-color: var(--color-surface);
		transition: all var(--transition-fast) var(--ease-in-out);

		&:focus-within {
			border-color: var(--color-primary);
			box-shadow: 0 0 0 var(--border-width-thin) var(--color-primary-light);
		}
	}

	.right-elements {
		display: flex;
		align-items: center;
		gap: var(--spacing-xs);
		padding-right: var(--spacing-md);
	}

	.clear-button {
		background: none;
		border: none;
		padding: var(--spacing-xs);
		cursor: pointer;
		color: var(--color-neutral);
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s ease;
		opacity: 0.7;

		&:hover {
			color: var(--color-text-on-surface);
			opacity: 1;
			background: var(--color-background-hover);
		}

		&:active {
			transform: scale(0.95);
		}
	}

	.loading-spinner {
		width: 16px;
		height: 16px;
		border: 2px solid var(--color-neutral);
		border-top-color: var(--color-primary);
		border-radius: 50%;
		animation: spin 1s linear infinite;
		pointer-events: none;
	}

	.action-button {
		background: none;
		border: none;
		color: var(--color-primary);
		cursor: pointer;
		font-size: var(--font-size-sm);
		padding: var(--spacing-xs) var(--spacing-sm);
		background-color: var(--color-neutral-darker, rgba(255, 255, 255, 0.05));
		border-radius: var(--border-radius-sm);

		&:hover {
			color: var(--color-primary-dark);
		}
	}

	:global(input),
	:global(textarea) {
		@include input-base;
		border: none;
		background: none;
		border-radius: 0;
		padding-right: var(--spacing-md);

		&:hover,
		&:focus {
			border: none;
			box-shadow: none;
		}
	}

	:global(textarea) {
		resize: none;
		height: 100%;
		padding: var(--spacing-md);
		line-height: 1.5;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>

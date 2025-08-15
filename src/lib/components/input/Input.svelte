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
	const hasClear = $derived(!isLoading && (!!clearButton || showClear))
	const hasAction = $derived(!!actionButton)
	const hasRightElements = $derived(!!isLoading || hasClear || hasAction)

	const onClear = () => {
		value = ''
	}
</script>

<div
	class="input-wrapper"
	style:--rounded-corners={roundedCorners ? 'var(--border-radius-full)' : undefined}
	style:--input-right-padding={hasRightElements ? 'var(--spacing-sm)' : 'var(--spacing-xs)'}
>
	<div class="input-container" style:grid-template-columns={hasRightElements ? '1fr auto' : '1fr'}>
		{@render children()}

		{#if hasRightElements}
			<div class="right-elements">
				{#if isLoading}
					<div class="loading-spinner"></div>
				{/if}
				{#if hasClear}
					<button class="clear-button" type="button" onclick={onClear} aria-label="Clear input">
						{#if clearButton}
							{@render clearButton()}
						{:else}
							<Clear color="var(--color-text-on-surface)" />
						{/if}
					</button>
				{/if}
				{#if actionButton}
					<button class="action-button" type="button" onclick={actionButton.onClick}>
						{actionButton.text}
					</button>
				{/if}
			</div>
		{/if}
	</div>
</div>

<style lang="scss">
	@use '$lib/styles/tokens' as *;

	@mixin input-base {
		width: 100%;
		height: 32px;
		padding: 0 var(--spacing-lg);
		font-family: var(--font-sans);
		transition: all var(--transition-fast) var(--ease-in-out);

		@include mobile {
			padding: 0 var(--spacing-md);
		}

		&:focus {
			outline: none;
			border-color: var(--color-primary);
			box-shadow: 0 0 0 var(--border-width-thin) var(--color-primary-light);
		}

		&:disabled {
			opacity: 0.5;
			cursor: not-allowed;
		}
	}

	.input-wrapper {
		display: flex;
		flex-direction: column;
		height: 100%;
		width: 100%;
	}

	.input-container {
		height: 100%;
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: center;
		border-radius: var(--rounded-corners, var(--border-radius-2xl));
		padding: var(--spacing-xs);
		background-color: var(--background, var(--color-surface));
		transition: all var(--transition-fast) var(--ease-in-out);
		box-shadow: var(--shadow-sm);

		/* Safari-specific fixes */
		-webkit-box-sizing: border-box;
		-webkit-transform: translateZ(0);
		-webkit-backface-visibility: hidden;
		box-sizing: border-box;
		transform: translateZ(0);
		backface-visibility: hidden;

		&:focus-within {
			border-color: var(--color-primary);
			box-shadow: 0 0 0 var(--border-width-thin) var(--color-primary-light);
		}

		/* Fallback for Safari grid issues */
		@supports (-webkit-appearance: none) {
			display: flex;
			align-items: center;
			gap: var(--spacing-xs);
		}
	}

	.right-elements {
		display: flex;
		align-items: center;
		gap: var(--spacing-xs);
		padding-right: var(--spacing-sm);
		flex-shrink: 0;

		@include mobile {
			padding-right: var(--spacing-xs);
		}
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
		margin: var(--spacing-xs);
	}

	.action-button {
		border: none;
		color: var(--color-text-on-secondary);
		cursor: pointer;
		font-size: var(--font-size-sm);
		padding: var(--spacing-xs) var(--spacing-md);
		background: var(--color-secondary);
		border-radius: var(--border-radius-lg);
		transition: background var(--transition-fast) var(--ease-in-out);

		&:hover {
			background: var(--color-secondary-dark);
		}
	}

	/* Safari-specific input fixes */
	.input-wrapper {
		:global(input),
		:global(textarea) {
			@include input-base;
			& {
				border: none;
				background: none;
				border-radius: 0;
				padding-right: var(--input-right-padding, var(--spacing-sm));
				color: var(--color-text-on-surface);
				-webkit-appearance: none;
				-webkit-box-sizing: border-box;
				-webkit-transform: translateZ(0);
				appearance: none;
				box-sizing: border-box;
				transform: translateZ(0);
			}

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
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>

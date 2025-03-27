<script lang="ts">
	import type { Snippet } from 'svelte'
	import Clear from '../icons/Clear.svelte'

	let {
		children,
		actionButton,
		isLoading,
		value = $bindable('')
	}: {
		children: Snippet
		actionButton?: { text: string; onClick: () => void }
		isLoading?: boolean
		value?: string
	} = $props()

	const showClear = $derived(value !== '')

	const onClear = () => {
		value = ''
	}
</script>

<div
	class="input-wrapper"
	style:--padding-right={actionButton
		? 'calc(var(--spacing-xl) * 3 + var(--spacing-xs) * 2)'
		: isLoading
		? 'calc(var(--spacing-xl) + var(--spacing-xs) + 16px + var(--spacing-xs))'
		: 'calc(var(--spacing-xl) + var(--spacing-xs))'}
>
	{@render children()}
	<div class="right-elements">
		{#if showClear}
			<button class="clear-button" onclick={onClear} aria-label="Clear input">
				<Clear />
			</button>
		{/if}
		{#if isLoading}
			<div class="loading-spinner"></div>
		{/if}
		{#if actionButton}
			<button class="action-button" type="button" onclick={actionButton.onClick}>
				{actionButton.text}
			</button>
		{/if}
	</div>
</div>

<style lang="scss">
	@mixin input-base {
		width: 100%;
		height: 37px;
		padding: 0 var(--spacing-lg);
		border: var(--border-width-thin) solid var(--color-neutral);
		border-radius: var(--border-radius-md);
		font-family: var(--font-sans);
		font-size: var(--font-size-sm);
		color: var(--color-neutral-light);
		background-color: var(--color-neutral-dark);
		transition: all var(--transition-fast) var(--ease-in-out);

		&::placeholder {
			color: var(--color-neutral-light);
			opacity: 0.5;
		}

		&:hover {
			border-color: var(--color-primary);
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
		position: relative;
		display: flex;
		flex-direction: column;
		height: 100%;

		.right-elements {
			position: absolute;
			right: var(--spacing-md);
			top: 50%;
			transform: translateY(-50%);
			display: flex;
			align-items: center;
			gap: var(--spacing-xs);
			z-index: 2;
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
				color: var(--color-text);
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

			&:hover {
				color: var(--color-primary-dark);
			}
		}

		:global(input),
		:global(select),
		:global(textarea) {
			@include input-base;
			padding-right: var(--padding-right);
		}

		:global(select) {
			cursor: pointer;
			appearance: none;
			padding-right: var(--spacing-xl);
			background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23999' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
			background-repeat: no-repeat;
			background-position: right var(--spacing-md) center;
			background-size: var(--spacing-md);

			&:focus {
				background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
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

<script lang="ts">
	import type { Snippet } from 'svelte'

	let { 
		children,
		actionButton,
		isLoading
	}: { 
		children: Snippet
		actionButton?: { text: string; onClick: () => void }
		isLoading?: boolean
	} = $props()
</script>

<div class="input-wrapper">
	{@render children()}
	<div class="right-elements">
		{#if isLoading}
			<div class="loading-spinner" />
		{/if}
		{#if actionButton}
			<button class="action-button" type="button" on:click={actionButton.onClick}>
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

		.right-elements {
			position: absolute;
			right: var(--spacing-md);
			top: 50%;
			transform: translateY(-50%);
			display: flex;
			align-items: center;
			gap: var(--spacing-md);
			z-index: 2;
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
			height: 10rem;
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

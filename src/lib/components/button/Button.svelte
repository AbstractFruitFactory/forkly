<script lang="ts">
	import type { Snippet } from 'svelte'

	type Variant = 'primary' | 'secondary' | 'text' | 'dotted'
	type Size = 'sm' | 'md' | 'lg'

	let {
		variant = 'primary',
		size = 'md',
		type = 'button',
		fullWidth = false,
		disabled = false,
		onclick,
		href,
		children,
		loading = false
	}: {
		variant?: Variant
		size?: Size
		type?: 'button' | 'submit' | 'reset'
		fullWidth?: boolean
		disabled?: boolean
		onclick?: (e: MouseEvent) => void
		href?: string
		children?: Snippet
		loading?: boolean
	} = $props()
</script>

<svelte:element
	this={href ? 'a' : 'button'}
	{href}
	{type}
	{disabled}
	class="button"
	class:primary={variant === 'primary'}
	class:secondary={variant === 'secondary'}
	class:text={variant === 'text'}
	class:dotted={variant === 'dotted'}
	class:sm={size === 'sm'}
	class:md={size === 'md'}
	class:lg={size === 'lg'}
	class:full-width={fullWidth}
	class:loading
	{onclick}
	role={href ? 'button' : undefined}
>
	<span class="content" aria-hidden={loading}>{@render children?.()}</span>
	{#if loading}
		<span class="loader"></span>
	{/if}
</svelte:element>

<style lang="scss">
	.button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--spacing-sm);
		border-radius: var(--border-radius-md);
		font-weight: 500;
		cursor: pointer;
		transition: all var(--transition-fast) var(--ease-in-out);
		background: transparent;
		color: var(--color-neutral);
		border: none;
		text-decoration: none;
		position: relative;
		overflow: hidden;
		text-wrap: nowrap;
		white-space: nowrap;
		min-width: fit-content;

		&::after {
			content: '';
			position: absolute;
			inset: 0;
			background: currentColor;
			opacity: 0;
			transition: opacity var(--transition-fast) var(--ease-in-out);
		}

		&:disabled {
			opacity: 0.6;
			cursor: not-allowed;

			&::after {
				display: none;
			}
		}

		&:hover:not(:disabled)::after {
			opacity: 0.1;
		}

		&:focus-visible {
			outline: 2px solid var(--color-primary);
			outline-offset: 2px;
		}

		&.full-width {
			width: 100%;
		}

		// Sizes
		&.sm {
			padding: var(--spacing-sm) var(--spacing-md);
			font-size: var(--font-size-sm);
		}

		&.md {
			padding: var(--spacing-md) var(--spacing-lg);
		}

		&.lg {
			padding: var(--spacing-lg) var(--spacing-xl);
			font-size: var(--font-size-lg);
		}

		// Variants
		&.primary {
			background: var(--color-secondary);
			color: white;

			&:active:not(:disabled) {
				transform: translateY(var(--spacing-xs));
			}
		}

		&.secondary {
			border: var(--border-width-thin) solid var(--color-neutral);

			&:hover:not(:disabled) {
				color: var(--color-primary);
				border-color: var(--color-primary);
			}
		}

		&.text {
			color: var(--color-primary);
			padding: 0;
			background: none;

			&:hover:not(:disabled) {
				text-decoration: underline;
			}

			&::after {
				display: none;
			}
		}

		&.dotted {
			border: var(--border-width-normal) dashed var(--color-neutral);
			padding: var(--spacing-md) var(--spacing-lg);
			margin-top: var(--spacing-md);
			width: 100%;

			&:hover:not(:disabled) {
				color: var(--color-primary);
				border-color: var(--color-primary);
			}
		}

		&.loading {
			cursor: wait;
		}
	}

	.content {
		visibility: visible;
	}

	.button.loading .content {
		visibility: hidden;
	}

	.loader {
		position: absolute;
		transform: translate(-50%, -50%);
		border: 0.2em solid rgba(255, 255, 255, 0.3);
		border-top: 0.2em solid #fff;
		border-radius: 50%;
		width: 1.2em;
		height: 1.2em;
		animation: spin 1s linear infinite;
		z-index: 10;
	}

	.button.primary .loader {
		border: 0.2em solid rgba(255, 255, 255, 0.3);
		border-top: 0.2em solid #fff;
	}

	.button.secondary .loader,
	.button.text .loader,
	.button.dotted .loader {
		border: 0.2em solid rgba(0, 0, 0, 0.1);
		border-top: 0.2em solid var(--color-primary);
	}

	.button {
		position: relative;
	}

	.button.loading {
		cursor: wait;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
</style>

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
		children
	}: {
		variant?: Variant
		size?: Size
		type?: 'button' | 'submit' | 'reset'
		fullWidth?: boolean
		disabled?: boolean
		onclick?: (e: MouseEvent) => void
		href?: string
		children?: Snippet
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
	{onclick}
	role={href ? 'button' : undefined}
>
	{@render children?.()}
</svelte:element>

<style lang="scss">
	.button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border-radius: var(--border-radius-md);
		font-weight: 500;
		cursor: pointer;
		transition: all var(--transition-fast) var(--ease-in-out);
		border: none;
		text-decoration: none;

		&:disabled {
			opacity: 0.6;
			cursor: not-allowed;
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

			&:hover:not(:disabled) {
				filter: brightness(0.9);
			}

			&:active:not(:disabled) {
				transform: translateY(var(--spacing-xs));
			}
		}

		&.secondary {
			background: transparent;
			border: var(--border-width-thin) solid var(--color-neutral);
			color: var(--color-neutral);

			&:hover:not(:disabled) {
				border-color: var(--color-primary);
				color: var(--color-primary);
			}
		}

		&.text {
			background: none;
			color: var(--color-primary);
			padding: 0;

			&:hover:not(:disabled) {
				text-decoration: underline;
			}
		}

		&.dotted {
			background: none;
			border: var(--border-width-normal) dashed var(--color-neutral);
			padding: var(--spacing-md) var(--spacing-lg);
			margin-top: var(--spacing-md);
			width: 100%;

			&:hover:not(:disabled) {
				border-color: var(--color-primary);
				color: var(--color-primary);
			}
		}
	}
</style>

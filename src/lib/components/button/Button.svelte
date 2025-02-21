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
	}
</style>

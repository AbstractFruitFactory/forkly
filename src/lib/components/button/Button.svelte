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
		children
	}: {
		variant?: Variant
		size?: Size
		type?: 'button' | 'submit' | 'reset'
		fullWidth?: boolean
		disabled?: boolean
		onclick?: (e: MouseEvent) => void
		children?: Snippet
	} = $props()
</script>

<button
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
>
	{@render children?.()}
</button>

<style lang="scss">
	.button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border-radius: 4px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
		border: none;

		&:disabled {
			opacity: 0.6;
			cursor: not-allowed;
		}

		&.full-width {
			width: 100%;
		}

		// Sizes
		&.sm {
			padding: 0.5rem 1rem;
			font-size: 0.875rem;
		}

		&.md {
			padding: 0.75rem 1.5rem;
			font-size: 1rem;
		}

		&.lg {
			padding: 1rem 2rem;
			font-size: 1.125rem;
		}

		// Variants
		&.primary {
			background: var(--color-secondary);
			color: white;

			&:hover:not(:disabled) {
				filter: brightness(0.9);
			}

			&:active:not(:disabled) {
				transform: translateY(1px);
			}
		}

		&.secondary {
			background: transparent;
			border: 1px solid var(--color-neutral);
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
			border: 2px dashed var(--color-neutral);
			padding: 12px 24px;
			margin-top: 16px;
			font-weight: 500;
			width: 100%;

			&:hover:not(:disabled) {
				border-color: var(--color-primary);
				color: var(--color-primary);
			}
		}
	}
</style>

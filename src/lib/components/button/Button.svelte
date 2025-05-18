<script lang="ts">
	import type { Snippet } from 'svelte'

	type Variant = 'primary' | 'secondary' | 'text' | 'dotted' | 'border' | 'pill'
	type Size = 'xs' | 'sm' | 'md' | 'lg'

	let {
		variant = 'primary',
		size = 'md',
		color,
		type = 'button',
		borderRadius = 'md',
		fullWidth = false,
		disabled = false,
		onclick,
		href,
		children,
		loading = false
	}: {
		variant?: Variant
		color?: string
		size?: Size
		type?: 'button' | 'submit' | 'reset'
		borderRadius?: 'md' | 'lg' | 'xl' | 'full'
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
	style={color ? `--button-color: ${color}` : undefined}
	{href}
	{type}
	{disabled}
	class="button"
	class:primary={variant === 'primary' && !color}
	class:secondary={variant === 'secondary' && !color}
	class:text={variant === 'text' && !color}
	class:dotted={variant === 'dotted' && !color}
	class:border={variant === 'border' && !color}
	class:pill={variant === 'pill' && !color}
	class:xs={size === 'xs'}
	class:sm={size === 'sm'}
	class:md={size === 'md'}
	class:lg={size === 'lg'}
	class:border-radius-md={borderRadius === 'md'}
	class:border-radius-lg={borderRadius === 'lg'}
	class:border-radius-xl={borderRadius === 'xl'}
	class:border-radius-full={borderRadius === 'full'}
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
		font-weight: 500;
		cursor: pointer;
		transition: all var(--transition-fast) var(--ease-in-out);
		background: var(--button-color, transparent);
		border: none;
		text-decoration: none;
		position: relative;
		overflow: hidden;
		text-wrap: nowrap;
		white-space: nowrap;
		width: fit-content;
		min-width: fit-content;

		&:disabled {
			opacity: 0.6;
			cursor: not-allowed;
		}

		&:focus-visible {
			outline: 2px solid var(--color-primary);
			outline-offset: 2px;
		}

		&.full-width {
			width: 100%;
		}

		.content {
			display: flex;
			align-items: center;
			justify-content: center;
			gap: var(--spacing-xs);
			color: black;
		}

		&.border-radius-md {
			border-radius: var(--border-radius-md);
		}

		&.border-radius-lg {
			border-radius: var(--border-radius-lg);
		}

		&.border-radius-xl {
			border-radius: var(--border-radius-xl);
		}

		&.border-radius-full {
			border-radius: var(--border-radius-full);
		}

		// Sizes
		&.xs > .content {
			padding: var(--spacing-xs) var(--spacing-sm);
			font-size: var(--font-size-xs);
		}

		&.sm > .content {
			padding: var(--spacing-sm) var(--spacing-md);
			font-size: var(--font-size-sm);
		}

		&.md > .content {
			padding: var(--spacing-md) var(--spacing-lg);
		}

		&.lg > .content {
			padding: var(--spacing-lg) var(--spacing-xl);
			font-size: var(--font-size-lg);
		}

		// Variants
		&.primary {
			background: var(--color-primary);
			color: black;
			font-weight: 600;

			&:hover:not(:disabled) {
				background: color-mix(in srgb, var(--color-primary), black 15%);
			}

			&:active:not(:disabled) {
				transform: translateY(var(--spacing-xs));
			}
		}

		&.secondary {
			background: var(--color-secondary);
			border: var(--border-width-thin) solid var(--color-neutral);

			&:hover:not(:disabled) {
				background: color-mix(in srgb, var(--color-secondary), black 15%);
			}
		}

		&.text {
			color: var(--color-primary);
			padding: 0;
			background: none;

			&:hover:not(:disabled) {
				text-decoration: underline;
			}
		}

		&.dotted {
			border: var(--border-width-normal) dashed var(--color-neutral);
			width: 100%;

			&:hover:not(:disabled) {
				color: var(--color-primary);
				border-color: var(--color-primary);
				background: rgba(0, 0, 0, 0.05);
			}
		}

		&.border {
			border: var(--border-width-normal) solid var(--color-neutral);

			&:hover:not(:disabled) {
				background: rgba(0, 0, 0, 0.05);
			}
		}

		&.pill {
			background-color: var(--color-neutral-dark);
			color: var(--color-white);
			border-radius: var(--border-radius-full);
			border: 1px solid var(--color-neutral);

			&:hover:not(:disabled) {
				border-color: var(--color-primary);
				background: var(--color-neutral-darker);
			}
			&:focus-visible {
				outline: none;
				box-shadow: 0 0 0 2px var(--color-primary-light);
			}
			> .content {
				padding: var(--spacing-md) var(--spacing-lg);
				font-size: var(--font-size-sm);
				color: white;
			}
		}

		&.loading {
			cursor: wait;
		}
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

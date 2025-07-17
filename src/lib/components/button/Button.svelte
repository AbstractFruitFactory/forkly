<script lang="ts">
	import type { Snippet } from 'svelte'

	type Variant = 'text' | 'dotted' | 'border' | 'pill'
	type Color = 'primary' | 'secondary' | 'neutral' | 'gradient'
	type Size = 'xs' | 'sm' | 'md' | 'lg'

	let {
		variant,
		color,
		buttonColor,
		size = 'md',
		type = 'button',
		borderRadius = 'xl',
		bold = false,
		fullWidth = false,
		disabled = false,
		onclick,
		href,
		children,
		loading = false,
		fullHeight = false
	}: {
		variant?: Variant
		color?: Color
		buttonColor?: string
		size?: Size
		type?: 'button' | 'submit' | 'reset'
		borderRadius?: 'md' | 'lg' | 'xl' | 'full'
		bold?: boolean
		fullWidth?: boolean
		disabled?: boolean
		onclick?: (e: MouseEvent) => void
		href?: string
		children?: Snippet
		loading?: boolean
		fullHeight?: boolean
	} = $props()
</script>

<svelte:element
	this={href ? 'a' : 'button'}
	style={buttonColor ? `--button-color: ${buttonColor}` : undefined}
	{href}
	{type}
	{disabled}
	class="button"
	class:primary={color === 'primary'}
	class:secondary={color === 'secondary'}
	class:neutral={color === 'neutral'}
	class:gradient={color === 'gradient'}
	class:text={variant === 'text'}
	class:dotted={variant === 'dotted'}
	class:border={variant === 'border'}
	class:pill={variant === 'pill'}
	class:bold
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
	class:full-height={fullHeight}
	{onclick}
	role={href ? 'button' : undefined}
>
	<span class="content" data-flip-id="search-button" aria-hidden={loading}
		>{@render children?.()}</span
	>
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
		cursor: pointer;
		transition: all var(--transition-fast) var(--ease-in-out);
		border: none;
		text-decoration: none;
		position: relative;
		overflow: hidden;
		text-wrap: nowrap;
		white-space: nowrap;
		width: fit-content;
		min-width: fit-content;
		font-variation-settings: 'wght' var(--font-weight-normal);
		box-shadow: var(--shadow-sm);

		&.full-height {
			height: 100%;
		}

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
			gap: var(--spacing-sm);
		}

		&.border-radius-md {
			border-radius: var(--border-radius-md);
		}

		&.border-radius-lg {
			border-radius: var(--border-radius-lg);
		}

		&.border-radius-xl {
			border-radius: var(--border-radius-2xl);
		}

		&.border-radius-full {
			border-radius: var(--border-radius-full);
		}

		// Sizes
		&.xs > .content {
			height: 35px;
			padding: var(--spacing-xs) var(--spacing-sm);
			font-size: var(--font-size-sm);
		}

		&.sm > .content {
			height: 35px;
			padding: var(--spacing-sm) var(--spacing-xl);
			font-size: var(--font-size-md);
		}

		&.md > .content {
			height: 40px;
			padding: var(--spacing-md) var(--spacing-lg);
			font-size: var(--font-size-md);
		}

		&.lg > .content {
			height: 40px;
			padding: var(--spacing-lg) var(--spacing-xl);
			font-size: var(--font-size-lg);
		}

		// Variants
		&.primary {
			background-color: var(--color-primary);

			&:hover:not(:disabled) {
				background-color: color-mix(in srgb, var(--color-primary), black 15%);
			}
			&:active:not(:disabled) {
				transform: translateY(var(--spacing-xs));
			}

			.content {
				color: var(--color-text-on-primary);
			}
		}

		&.secondary {
			background-color: var(--color-secondary);
			border: var(--border-width-thin) solid var(--color-neutral);

			&:hover:not(:disabled) {
				background-color: color-mix(in srgb, var(--color-secondary), black 15%);
			}

			.content {
				color: var(--color-text-on-primary);
			}
		}

		&.gradient {
			background: var(--color-gradient);
			border: var(--border-width-thin) solid var(--color-primary-dark) !important;

			&:hover:not(:disabled) {
				transform: translateY(-2px);
				box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
			}

			&:active:not(:disabled) {
				transform: translateY(0);
			}

			.content {
				color: var(--color-text-on-secondary);
				font-weight: var(--font-weight-bold);
			}
		}

		&.neutral {
			background-color: var(--color-surface);
			border: var(--border-width-thin) solid var(--color-neutral);

			&:hover:not(:disabled) {
				background-color: color-mix(in srgb, var(--color-surface), black 15%);
			}

			.content {
				color: var(--color-text-on-surface);
			}
		}

		&.text {
			background: none;
			padding: 0;
			box-shadow: none;

			&:hover:not(:disabled) {
				text-decoration: underline;
			}

			.content {
				color: var(--color-primary);
			}
		}

		&.dotted {
			border: var(--border-width-normal) dashed var(--color-neutral);
			width: 100%;

			&:hover:not(:disabled) {
				border-color: var(--color-primary);
				background: rgba(0, 0, 0, 0.05);
			}
		}

		&.border {
			border: var(--border-width-thin) solid var(--color-neutral);

			&:hover:not(:disabled) {
				background: rgba(0, 0, 0, 0.05);
			}
		}

		&.bold {
			font-weight: var(--font-weight-bold);
			font-variation-settings: 'wght' var(--font-weight-bold);
		}

		&.pill {
			border-radius: var(--border-radius-full);

			.content {
				color: var(--color-text-on-secondary);
			}

			&:focus-visible {
				outline: none;
				box-shadow: 0 0 0 2px var(--color-primary-light);
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

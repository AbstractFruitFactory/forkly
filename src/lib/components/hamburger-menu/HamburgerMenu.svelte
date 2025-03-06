<script lang="ts">
	let {
		isOpen = $bindable(false),
		size = 'md',
		ariaLabel = 'Toggle menu'
	}: { isOpen: boolean; size: 'sm' | 'md' | 'lg'; ariaLabel: string } = $props()
</script>

<button
	class="menu-toggle {size}"
	onclick={() => (isOpen = !isOpen)}
	aria-expanded={isOpen}
	aria-label={ariaLabel}
>
	<span class="sr-only">{ariaLabel}</span>
	<div class="hamburger-icon" class:open={isOpen}>
		<span class="line line-1"></span>
		<span class="line line-2"></span>
		<span class="line line-3"></span>
	</div>
</button>

<style lang="scss">
	.menu-toggle {
		background: transparent;
		border: none;
		border-radius: var(--border-radius-sm);
		color: var(--color-neutral);
		transition: all var(--transition-fast) var(--ease-in-out);
		cursor: pointer;
		padding: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		
		&.sm {
			padding: var(--spacing-xs);
		}
		
		&.md {
			padding: var(--spacing-xs) var(--spacing-sm);
		}
		
		&.lg {
			padding: var(--spacing-sm);
		}
		
		&:hover,
		&:focus-visible {
			color: var(--color-primary);
			outline: none;
		}
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		border: 0;
	}

	.hamburger-icon {
		width: 20px;
		height: 16px;
		position: relative;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		
		&.open {
			.line-1 {
				transform: translateY(7px) rotate(45deg);
			}
			
			.line-2 {
				opacity: 0;
			}
			
			.line-3 {
				transform: translateY(-7px) rotate(-45deg);
			}
		}
		
		.line {
			display: block;
			height: 2px;
			width: 100%;
			background-color: currentColor;
			border-radius: 2px;
			transition: all 0.3s ease;
			transform-origin: center;
		}
	}
</style>

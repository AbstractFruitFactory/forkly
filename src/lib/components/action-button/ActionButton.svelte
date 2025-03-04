<script lang="ts">
	import type { ComponentType } from 'svelte'

	let {
		count = 0,
		isActive = false,
		interactive = false,
		onAction,
		icon,
		activeLabel = 'Remove',
		inactiveLabel = 'Add',
		countLabel = 'items'
	}: {
		count: number
		isActive?: boolean
		interactive?: boolean
		onAction?: () => void
		icon: ComponentType
		activeLabel?: string
		inactiveLabel?: string
		countLabel?: string
	} = $props()
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<svelte:element
	this={interactive ? 'button' : 'div'}
	class="action-button"
	class:active={isActive}
	onclick={interactive ? onAction : undefined}
	aria-label={interactive ? (isActive ? `${activeLabel}` : `${inactiveLabel}`) : `${count} ${countLabel}`}
>
	<svelte:component 
		this={icon} 
		size={interactive ? 20 : 16} 
		class={interactive ? (isActive ? 'filled' : '') : 'filled'} 
	/>
	<span class="count">{count}</span>
</svelte:element>

<style lang="scss">
	.action-button {
		background: var(--inactive-bg-color);
		border: none;
		border-radius: var(--border-radius-full);
		padding: var(--spacing-xs) var(--spacing-sm);
		color: var(--inactive-color);
		display: flex;
		align-items: center;
		gap: var(--spacing-xs);
		width: fit-content;

		&.active {
			color: var(--active-color);
			background: var(--active-bg-color);
		}

		:global(svg) {
			transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
			transform-origin: center;
			fill: transparent;
		}

		:global(.filled) {
			fill: currentColor;
		}
	}

	button.action-button {
		cursor: pointer;
		transition: all var(--transition-fast) var(--ease-out);

		&:hover {
			transform: scale(1.05);

			:global(svg) {
				transform: scale(1.15);
			}
		}

		:global(svg) {
			transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
		}

		&.active :global(svg) {
			transform: scale(1.1);
			animation: pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
		}
	}

	@keyframes pop {
		0% {
			transform: scale(1);
			fill: transparent;
		}
		50% {
			transform: scale(1.4);
			fill: currentColor;
		}
		100% {
			transform: scale(1.2);
			fill: currentColor;
		}
	}

	.count {
		font-size: var(--font-size-sm);
		font-weight: 600;
	}
</style> 
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
		countLabel = 'items',
		showCount = true
	}: {
		count: number
		isActive?: boolean
		interactive?: boolean
		onAction?: () => void
		icon: ComponentType
		activeLabel?: string
		inactiveLabel?: string
		countLabel?: string
		showCount?: boolean
	} = $props()
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<svelte:element
	this={interactive ? 'button' : 'div'}
	class="action-button"
	class:active={isActive}
	onclick={interactive ? onAction : undefined}
	aria-label={interactive
		? isActive
			? `${activeLabel}`
			: `${inactiveLabel}`
		: `${count} ${countLabel}`}
>
	<svelte:component this={icon} size={20} class={isActive ? 'filled' : ''} />
	{#if showCount}
		<span class="count">{count}</span>
	{/if}
</svelte:element>

<style lang="scss">
	.action-button {
		background: color-mix(in srgb, var(--color-neutral-dark) 90%, white);
		border: none;
		border-radius: var(--border-radius-full);
		padding: var(--spacing-xs) var(--spacing-sm);
		color: #b8b8b8;
		display: flex;
		align-items: center;
		gap: 6px;
		width: fit-content;
		height: 28px;
		transition: all 0.15s ease;
		padding: var(--spacing-md);

		&.active {
			color: var(--active-color, #ff4500);
			background: rgba(255, 69, 0, 0.15);
		}

		:global(svg) {
			transition: all 0.15s ease;
			transform-origin: center;
			width: 20px;
			height: 20px;
			opacity: 0.8;
		}

		:global(.filled) {
			fill: currentColor;
			opacity: 1;
		}
	}

	button.action-button {
		cursor: pointer;

		&:hover {
			background: rgba(255, 255, 255, 0.12);
			color: #ffffff;

			:global(svg) {
				opacity: 1;
			}
		}

		&:active {
			background: rgba(255, 255, 255, 0.16);
		}

		&.active {
			:global(svg) {
				transform: scale(1);
				animation: none;
			}

			&:hover {
				background: rgba(255, 69, 0, 0.25);
				color: var(--active-color, #ff4500);
			}
		}
	}

	.count {
		font-size: 12px;
		font-weight: 500;
		color: inherit;
	}
</style>

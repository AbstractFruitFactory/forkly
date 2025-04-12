<script lang="ts">
	import { fade, slide } from 'svelte/transition'
	import type { Snippet } from 'svelte'

	let {
		isOpen = $bindable(false),
		title,
		children
	}: {
		isOpen?: boolean
		title?: string
		children: Snippet
	} = $props()

	let drawer: HTMLDivElement

	const handleClickOutside = (e: MouseEvent) => {
		if (drawer && !drawer.contains(e.target as Node) && isOpen) {
			isOpen = false
		}
	}

	const handleKeydown = (e: KeyboardEvent) => {
		if (e.key === 'Escape' && isOpen) {
			isOpen = false
		}
	}
</script>

<svelte:document onmousedown={handleClickOutside} onkeydown={handleKeydown} />

{#if isOpen}
	<div class="drawer-overlay" transition:fade={{ duration: 200 }} />
	<div class="drawer-container" bind:this={drawer} transition:slide={{ duration: 300 }}>
		{#if title}
			<div class="drawer-header">
				<div>
					{#if title}
						<h3 class="drawer-title">{title}</h3>
					{/if}
				</div>

				<button class="drawer-close" onclick={() => (isOpen = false)} aria-label="Close drawer">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<line x1="18" y1="6" x2="6" y2="18" />
						<line x1="6" y1="6" x2="18" y2="18" />
					</svg>
				</button>
			</div>
		{/if}
		<div class="drawer-content">
			{@render children()}
		</div>
	</div>
{/if}

<style lang="scss">
	@import '$lib/global.scss';

	.drawer-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.8);
		z-index: var(--z-modal);
	}

	.drawer-container {
		position: fixed;
		bottom: 0;
		left: 50%;
		transform: translateX(-50%);
		background-color: var(--color-background);
		border-radius: var(--border-radius-lg) var(--border-radius-lg) 0 0;
		box-shadow: var(--shadow-lg);
		width: 100%;
		max-width: 800px;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		height: 80dvh;
		z-index: calc(var(--z-modal) + 1);
		padding: var(--spacing-md);

		@include mobile {
			width: 100vw;
			border-radius: 0;
			box-shadow: none;
			padding: 0;
		}
	}

	.drawer-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--spacing-lg);
		padding-bottom: 0;
	}

	.drawer-title {
		margin: 0;
		font-size: var(--font-size-lg);
		font-weight: 600;
	}

	.drawer-close {
		background: transparent;
		border: none;
		cursor: pointer;
		padding: var(--spacing-xs);
		color: var(--color-neutral);
		border-radius: var(--border-radius-sm);
		display: flex;
		align-items: center;
		justify-content: center;
		transition:
			background-color var(--transition-fast) var(--ease-in-out),
			color var(--transition-fast) var(--ease-in-out);

		&:hover {
			background-color: var(--color-hover);
			color: var(--color-primary);
		}
	}

	.drawer-content {
		padding: var(--spacing-lg);
		overflow-y: auto;
		height: 100%;

		@include mobile {
			padding: var(--spacing-md);
		}
	}
</style>

<script lang="ts">
	import { fade, slide, fly } from 'svelte/transition'
	import { onMount, type Snippet } from 'svelte'
	import ArrowLeft from 'lucide-svelte/icons/arrow-left'

	let {
		isOpen = $bindable(false),
		title,
		children,
		position = 'bottom',
		showBackButton = false,
		onBack
	}: {
		isOpen?: boolean
		title?: string
		children: Snippet
		position?: 'bottom' | 'side'
		showBackButton?: boolean
		onBack?: () => void
	} = $props()

	let drawer = $state<HTMLDivElement>()
	let drawerContainer: HTMLDivElement

	onMount(() => {
		document.body.appendChild(drawerContainer)

		return () => {
			document.body.removeChild(drawerContainer)
		}
	})

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

	const handleBack = () => {
		onBack?.()
		isOpen = false
	}
</script>

<svelte:document onmousedown={handleClickOutside} onkeydown={handleKeydown} />

<div class="drawer" bind:this={drawerContainer}>
	{#if isOpen}
		<div class="drawer-overlay" transition:fade={{ duration: 200 }}></div>
		<div
			class="drawer-container"
			class:side-drawer={position === 'side'}
			bind:this={drawer}
			transition:fly={position === 'side'
				? { x: 500, duration: 200, opacity: 1 }
				: { y: 800, duration: 300, opacity: 1 }}
		>
			<div class="drawer-header">
				<div class="header-left">
					{#if showBackButton}
						<button class="drawer-back" onclick={handleBack} aria-label="Go back">
							<ArrowLeft size={20} />
						</button>
					{/if}
					{#if title}
						<h3 class="drawer-title">{title}</h3>
					{/if}
				</div>
				{#if !showBackButton}
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
				{/if}
			</div>
			<div class="drawer-content">
				{@render children()}
			</div>
		</div>
	{/if}
</div>

<style lang="scss">
	@use '$lib/styles/tokens' as *;

	.drawer {
		display: none;

		@include mobile {
			display: block;
		}
	}

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
		display: flex;
		flex-direction: column;
		height: 80dvh;
		z-index: calc(var(--z-modal) + 1);

		@include mobile {
			width: 100vw;
			border-radius: 0;
			box-shadow: none;
			padding: 0;
		}

		&.side-drawer {
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			transform: none;
			border-radius: 0;
			box-shadow: none;
			max-width: none;

			@include mobile {
				width: 100%;
			}
		}
	}

	.drawer-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--spacing-md);
		padding-bottom: 0;

		.header-left {
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			gap: var(--spacing-md);
		}
	}

	.drawer-title {
		margin: 0;
		font-size: var(--font-size-lg);
		font-weight: 600;

		.side-drawer & {
			font-size: var(--font-size-2xl);
		}
	}

	.drawer-back {
		background: var(--color-secondary);
		border: none;
		border-radius: 50%;
		width: 50px;
		height: 50px;
		font-size: 1.5rem;
		color: var(--color-text-on-primary);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: var(--spacing-sm);
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
		flex: 1;
		min-height: 0;

		@include mobile {
			padding: var(--spacing-md);
		}

		.side-drawer & {
			padding: var(--spacing-lg);
			overflow-y: auto;
		}
	}
</style>

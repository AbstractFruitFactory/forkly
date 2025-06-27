<script lang="ts">
	import type { Snippet } from 'svelte'
	import { fade } from 'svelte/transition'
	import gsap from 'gsap'
	import { onMount, tick } from 'svelte'

	let {
		isOpen = $bindable(false),
		title = $bindable(''),
		showCloseButton = $bindable(true),
		closeOnClickOutside = $bindable(true),
		width = $bindable('400px'),
		onClose = $bindable<(() => void) | undefined>(undefined),
		children = $bindable<Snippet | undefined>(undefined),
		headerActions = $bindable<Snippet | undefined>(undefined),
		openFrom = $bindable<DOMRect | null>(null)
	} = $props()

	let popupWrapper: HTMLDivElement | null = $state(null)
	let showContent = $state(true)

	// Animate opening: from card‐rect → final popup rect
	async function animateOpen(rect: DOMRect) {
		await tick() // wait for DOM to render
		if (!popupWrapper) return

		// 1. measure the *final* bounding box
		const finalRect = popupWrapper.getBoundingClientRect()

		// 2. compute the deltas
		const scaleX = rect.width / finalRect.width
		const scaleY = rect.height / finalRect.height
		const x = rect.left - finalRect.left
		const y = rect.top - finalRect.top

		// 3. snap into place
		gsap.set(popupWrapper, {
			transformOrigin: 'top left',
			x,
			y,
			scaleX,
			scaleY
		})

		// 4. animate back to identity (final CSS position/size)
		gsap.to(popupWrapper, {
			duration: 0.3,
			x: 0,
			y: 0,
			scaleX: 1,
			scaleY: 1,
			ease: 'power1.inOut',
			clearProps: 'transform'
		})
	}

	// Animate closing: final popup rect → card‐rect
	function animateClose(rect: DOMRect) {
		if (!popupWrapper) return Promise.resolve()
		const finalRect = popupWrapper.getBoundingClientRect()
		const scaleX = rect.width / finalRect.width
		const scaleY = rect.height / finalRect.height
		const x = rect.left - finalRect.left
		const y = rect.top - finalRect.top

		return new Promise<void>((resolve) => {
			gsap.to(popupWrapper!, {
				duration: 0.3,
				x,
				y,
				scaleX,
				scaleY,
				ease: 'power1.inOut',
				onComplete: resolve
			})
		})
	}

	// when isOpen & openFrom change → animate open
	$effect(() => {
		if (isOpen && openFrom) {
			animateOpen(openFrom)
		}
		if (isOpen) {
			showContent = true
		}
	})

	// close handler: reverse‐animate then call onClose
	const handleClose = async () => {
		showContent = false
		if (openFrom && popupWrapper) {
			await animateClose(openFrom)
		}
		onClose?.()
	}

	const handleClickOutside = (e: MouseEvent) => {
		if (closeOnClickOutside && popupWrapper && !popupWrapper.contains(e.target as Node) && isOpen) {
			handleClose()
		}
	}

	const handleKeydown = (e: KeyboardEvent) => {
		if (e.key === 'Escape' && isOpen) {
			handleClose()
		}
	}
</script>

<svelte:document onmousedown={handleClickOutside} onkeydown={handleKeydown} />

{#if isOpen}
	<div class="popup-overlay" transition:fade={{ duration: openFrom ? 0 : 200 }}>
		<div class="popup-container" bind:this={popupWrapper} style="max-width: {width};">
			{#if title || showCloseButton}
				<div class="popup-header">
					<div>
						{#if title}
							<h3 class="popup-title">{title}</h3>
						{/if}
					</div>
					<div class="popup-actions">
						{@render headerActions?.()}
						{#if showCloseButton}
							<button class="popup-close" onclick={handleClose} aria-label="Close popup">
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
				</div>
			{/if}
			{#if showContent}
				<div class="popup-content">
					{@render children?.()}
				</div>
			{/if}
		</div>
	</div>
{/if}

<style lang="scss">
	@import '$lib/global.scss';

	.popup-overlay {
		position: fixed;
		inset: 0;
		background-color: rgba(0, 0, 0, 0.8);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: var(--z-modal);
		padding: var(--spacing-md);
	}

	.popup-container {
		position: relative;
		background-color: var(--color-background);
		border-radius: var(--border-radius-lg);
		box-shadow: var(--shadow-lg);
		width: 100%;
		max-height: 90dvh;
		overflow: hidden;
		display: flex;
		flex-direction: column;

		@include mobile {
			width: 100vw;
			height: 100dvh;
			border-radius: 0;
			box-shadow: none;
			max-height: none;
		}
	}

	.popup-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--spacing-lg);
		padding-bottom: 0;
	}

	.popup-actions {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
	}

	.popup-title {
		margin: 0;
		font-size: var(--font-size-lg);
		font-weight: 600;
	}

	.popup-close {
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

	.popup-content {
		padding: var(--spacing-lg);
		overflow-y: scroll;
		height: 100%;
		scrollbar-width: thin;

		@include mobile {
			padding: var(--spacing-md);
		}
	}
</style>

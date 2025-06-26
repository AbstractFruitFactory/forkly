<script lang="ts">
	import type { Snippet } from 'svelte'
	import { fade, scale } from 'svelte/transition'
	import { quintOut } from 'svelte/easing'
	import gsap from 'gsap'
	import { tick } from 'svelte'

	let {
		isOpen = $bindable(false),
		title = $bindable(''),
		showCloseButton = $bindable(true),
		closeOnClickOutside = $bindable(true),
		width = $bindable('400px'),
		onClose = $bindable<(() => void) | undefined>(undefined),
		children = $bindable<Snippet | undefined>(undefined),
		headerActions = $bindable<Snippet | undefined>(undefined),
		openFrom = $bindable<DOMRect | null>(null),
	} = $props()

	let popupWrapper: HTMLDivElement | null = $state(null)

	async function animateOpen(rect: DOMRect) {
		console.log('animateOpen', rect)
		await tick()
		if (!popupWrapper) return

		const startX = rect.left
		const startY = rect.top
		
		gsap.from(
			popupWrapper,
			{
				x: startX,
				y: startY,
				width: rect.width,
				height: rect.height,
				duration: 0.3,
				ease: 'power1.inOut',
				clearProps: 'width,height,transform'
			}
		)
	}

	$effect(() => {
		if (isOpen && openFrom) {
			animateOpen(openFrom)
		}
	})

	const handleClose = () => {
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
	<div class="popup-overlay" transition:fade={{ duration: 200 }}>
		<div
			class="popup-container"
			bind:this={popupWrapper}
			transition:scale={openFrom ? undefined : { duration: 300, easing: quintOut, start: 0.95 }}
			style="max-width: {width};"
		>
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
			<div class="popup-content">
				{@render children?.()}
			</div>
		</div>
	</div>
{/if}

<style lang="scss">
	@import '$lib/global.scss';

	.popup-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.8);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: var(--z-modal);
		padding: var(--spacing-md);
		transform-origin: top left;

		@include mobile {
			padding: 0;
		}
	}

	.popup-container {
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
		overflow-y: auto;
		height: 100%;

		@include mobile {
			padding: var(--spacing-md);
		}
	}
</style>

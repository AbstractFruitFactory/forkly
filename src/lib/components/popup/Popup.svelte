<script lang="ts">
	import type { Snippet } from 'svelte'
	import { fade, scale } from 'svelte/transition'
	import { tick } from 'svelte'
	import gsap from 'gsap'

	let {
		isOpen = $bindable(false),
		title,
		showCloseButton = true,
		closeOnClickOutside = true,
		width = '400px',
		onClose,
		children,
		headerActions,
		animateFrom = null
	}: {
		isOpen?: boolean
		title?: string
		showCloseButton?: boolean
		closeOnClickOutside?: boolean
		width?: string
		onClose?: () => void
		children?: Snippet
		headerActions?: Snippet
		animateFrom?: HTMLElement | null
	} = $props()

	export const open = async () => {
		await handleOpen()
	}

	export const close = async () => {
		await handleClose()
	}

	let ANIMATION_DURATION = 0.35

	let popupContainer: HTMLDivElement

	const handleOpen = async () => {
		if (animateFrom) {
			const flip = (await import('gsap/Flip')).Flip
			if (!flip) return

			gsap.set(animateFrom, { opacity: 0, pointerEvents: 'none' })

			isOpen = true
			await tick()

			flip.fit(popupContainer, animateFrom)

			const state = flip.getState(popupContainer)

			gsap.set(popupContainer, {
				clearProps: true
			})

			const content = popupContainer.querySelector('.popup-content') as HTMLElement

			flip.from(state, {
				duration: ANIMATION_DURATION,
				ease: 'power1.out',
				scale: true,
				onStart: () => {
					gsap.set(content, {
						opacity: 0
					})
				},
				onComplete: () => {
					gsap.to(content, {
						opacity: 1,
						clearProps: true,
						duration: 0.1
					})
				}
			})
		} else {
			isOpen = true
		}
	}

	const handleClose = async () => {
		if (animateFrom) {
			const flip = (await import('gsap/Flip')).Flip
			if (!flip) return

			const state = flip.getState(popupContainer)

			const content = popupContainer.querySelector('.popup-content') as HTMLElement
			const header = popupContainer.querySelector('.popup-header') as HTMLElement

			gsap.set(animateFrom, { clearProps: true })

			flip.fit(popupContainer, animateFrom)

			flip.from(state, {
				duration: ANIMATION_DURATION,
				ease: 'power2.inOut',
				scale: true,
				onStart: () => {
					gsap.set(content, {
						opacity: 0
					})
					gsap.set(header, {
						opacity: 0
					})
				},
				onComplete: () => {
					isOpen = false
					onClose?.()
				}
			})
		} else {
			isOpen = false
			onClose?.()
		}
	}

	const handleClickOutside = (e: MouseEvent) => {
		if (closeOnClickOutside && e.target === e.currentTarget && isOpen) {
			handleClose()
		}
	}

	const handleKeydown = (e: KeyboardEvent) => {
		if (e.key === 'Escape' && isOpen) {
			handleClose()
		}
	}
</script>

<svelte:document onkeydown={handleKeydown} />

{#if isOpen}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="popup-overlay"
		transition:fade={{ duration: animateFrom ? 0 : 200 }}
		onclick={handleClickOutside}
	>
		{#snippet container()}
			<div bind:this={popupContainer} class="popup-container" style="width: {width};">
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
								<button type="button" class="popup-close" onclick={close} aria-label="Close popup">
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
		{/snippet}

		{#if animateFrom}
			{@render container()}
		{:else}
			<div transition:scale|global>
				{@render container()}
			</div>
		{/if}
	</div>
{/if}

<style lang="scss">
	@use '$lib/styles/tokens' as *;

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
		border-radius: var(--border-radius-3xl);
		box-shadow: var(--shadow-lg);
		width: 100%;
		margin: 0 var(--spacing-2xl);
		max-width: min(1200px, calc(100vw - var(--spacing-xl)));
		max-height: 90dvh;
		overflow: hidden;
		display: flex;
		flex-direction: column;

		@include mobile {
			margin: 0;
		}
	}

	.popup-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--spacing-lg);
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
		padding: var(--spacing-lg) var(--spacing-2xl);
		overflow-y: scroll;
		height: 100%;
		scrollbar-width: thin;

		@include mobile {
			padding: var(--spacing-md);
		}
	}
</style>

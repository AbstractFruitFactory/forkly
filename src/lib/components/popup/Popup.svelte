<script lang="ts">
	import type { Snippet } from 'svelte'
	import { fade } from 'svelte/transition'

	let {
		isOpen = $bindable(false),
		title,
		showCloseButton = true,
		closeOnClickOutside = true,
		width = '400px',
		onClose,
		children,
		headerActions
	}: {
		isOpen?: boolean
		title?: string
		showCloseButton?: boolean
		closeOnClickOutside?: boolean
		width?: string
		onClose?: () => void
		children?: Snippet
		headerActions?: Snippet
	} = $props()

	const handleClose = () => {
		onClose?.()
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
	<div class="popup-overlay" transition:fade={{ duration: 200 }} onclick={handleClickOutside}>
		<div class="popup-container" style="max-width: {width};">
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
		padding: var(--spacing-lg);
		overflow-y: scroll;
		height: 100%;
		scrollbar-width: thin;

		@include mobile {
			padding: var(--spacing-md);
		}
	}
</style>

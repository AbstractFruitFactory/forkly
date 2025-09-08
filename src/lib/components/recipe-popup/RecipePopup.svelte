<script lang="ts">
	import Popup from '../popup/Popup.svelte'
	import Drawer from '../drawer/Drawer.svelte'
	import RecipePage from '../../../routes/(pages)/recipe/[id]/+page.svelte'
	import { mobileStore } from '$lib/state/mobile.svelte'
	import Button from '$lib/components/button/Button.svelte'
	import type { PageData } from '../../../routes/(pages)/recipe/[id]/$types'
	import FloatingActionButton from '$lib/components/floating-action-button/FloatingActionButton.svelte'
	import XIcon from 'lucide-svelte/icons/x'
	import CheckIcon from 'lucide-svelte/icons/check'

	let {
		id,
		onClose,
		animateFrom = null,
		recipeData,
		onBack,
		onUpload,
		preview = false,
		actionText = 'Upload'
	}: {
		id?: string
		onClose?: () => void
		animateFrom?: HTMLElement | null
		recipeData?: PageData['recipeData']
		onBack?: () => void
		onUpload?: () => void
		preview?: boolean
		actionText?: string
	} = $props()

	export const open = async () => {
		if (mobileStore.isMobile) {
			isDrawerOpen = true
		} else {
			if (!popup) return
			await popup.open()
		}
		window.scrollTo(0, 0)
	}

	export const close = async () => {
		if (mobileStore.isMobile) {
			isDrawerOpen = false
		} else {
			if (!popup) return
			await popup.close()
		}
	}

	let popup = $state<Popup>()
	let isDrawerOpen = $state(false)
	let isUploading = $state(false)

	const handleUploadClick = async () => {
		if (isUploading) return
		isUploading = true
		try {
			await onUpload?.()
		} finally {
			isUploading = false
		}
	}

	const handleBackClick = () => {
		if (isUploading) return
		onBack?.()
	}
</script>

{#if mobileStore.isMobile}
	<Drawer bind:isOpen={isDrawerOpen} onBack={onClose} position="side" showBackButton={true}>
		<div class="recipe-layout">
			<RecipePage
				params={{ id: id ?? '' }}
				data={recipeData ? { recipeData, user: undefined } : { recipeData: null, user: undefined }}
				{preview}
			/>
			{#if preview}
				<div class="floating-actions">
					<div class="fab-cancel">
						<FloatingActionButton onClick={handleBackClick}>
							{#snippet children()}
								<XIcon size={20} />
							{/snippet}
						</FloatingActionButton>
					</div>
					<div class="fab-upload">
						<FloatingActionButton onClick={handleUploadClick}>
							{#snippet children()}
								{#if isUploading}
									<div class="spinner" aria-label="Uploading"></div>
								{:else}
									<CheckIcon size={20} />
								{/if}
							{/snippet}
						</FloatingActionButton>
					</div>
				</div>
			{/if}
		</div>
	</Drawer>
{:else}
	<Popup {onClose} width="90vw" {animateFrom} bind:this={popup}>
		<div class="recipe-layout">
			<RecipePage
				params={{ id: id ?? '' }}
				data={recipeData ? { recipeData, user: undefined } : { recipeData: null, user: undefined }}
				{preview}
			/>
			{#if preview}
				<div class="preview-actions">
					<Button color="neutral" onclick={handleBackClick}>Go back</Button>
					<Button color="primary" onclick={handleUploadClick} loading={isUploading}>{actionText}</Button>
				</div>
			{/if}
		</div>
	</Popup>
{/if}

<style lang="scss">
	@use '$lib/styles/tokens' as *;

	.recipe-layout {
		min-height: 100%;
		display: flex;
		flex-direction: column;
	}

	.preview-actions {
		position: absolute;
		width: 100%;
		left: 0;
		bottom: 0;
		z-index: 1;
		background: var(--color-background);
		border-top: 1px solid var(--color-border);
		padding: var(--spacing-md) 0;
		display: flex;
		justify-content: center;
		gap: var(--spacing-lg);
	}

	.floating-actions {
		position: fixed;
		left: 50%;
		bottom: var(--spacing-md);
		transform: translateX(-50%);
		display: flex;
		gap: var(--spacing-xl);
		z-index: calc(var(--z-sticky) + 1);
	}

	/* Color overrides for floating buttons */
	:global(.fab-cancel .action-button) {
		background: var(--color-error);
		border: none;
		color: var(--color-text-on-primary);
	}

	:global(.fab-upload .action-button) {
		background: var(--color-success);
		border: none;
		color: var(--color-text-on-primary);
	}

	.spinner {
		width: 20px;
		height: 20px;
		border: 2px solid rgba(255, 255, 255, 0.5);
		border-top-color: var(--color-text-on-primary);
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>

<script lang="ts">
	import Popup from '../popup/Popup.svelte'
	import Drawer from '../drawer/Drawer.svelte'
	import RecipePage from '../../../routes/(pages)/recipe/[id]/+page.svelte'
	import { mobileStore } from '$lib/state/mobile.svelte'
	import Button from '$lib/components/button/Button.svelte'
	import type { PageData } from '../../../routes/(pages)/recipe/[id]/$types'

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
				<div class="preview-actions">
					<Button color="neutral" onclick={onBack}>Go back</Button>
					<Button color="primary" onclick={onUpload}>{actionText}</Button>
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
					<Button color="neutral" onclick={onBack}>Go back</Button>
					<Button color="primary" onclick={onUpload}>{actionText}</Button>
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
</style>

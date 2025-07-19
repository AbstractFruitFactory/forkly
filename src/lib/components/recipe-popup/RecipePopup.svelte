<script lang="ts">
	import Popup from '../popup/Popup.svelte'
	import Drawer from '../drawer/Drawer.svelte'
	import RecipePage from '../../../routes/(pages)/recipe/[id]/+page.svelte'
	import type { ComponentProps } from 'svelte'
	import { mobileStore } from '$lib/state/mobile.svelte'

	let {
		data,
		onClose,
		animateFrom = null
	}: {
		data: ComponentProps<typeof RecipePage>['data']
		onClose: () => void
		animateFrom?: HTMLElement | null
	} = $props()

	export const open = async () => {
		if (mobileStore.isMobile) {
			isDrawerOpen = true
		} else {
			await popup.open()
		}
		window.scrollTo(0, 0)
	}

	export const close = async () => {
		if (mobileStore.isMobile) {
			console.log('closing drawer')
			isDrawerOpen = false
		} else {
			await popup.close()
		}
	}

	let popup: Popup
	let isDrawerOpen = $state(false)
</script>

{#if mobileStore.isMobile}
	<Drawer bind:isOpen={isDrawerOpen} onBack={onClose} position="side" showBackButton={true}>
		<RecipePage {data} />
	</Drawer>
{:else}
	<Popup {onClose} width="90vw" {animateFrom} bind:this={popup}>
		<RecipePage {data} />
	</Popup>
{/if}

<style lang="scss">
	.fullscreen-link {
		display: flex;
		align-items: center;
		padding: var(--spacing-xs);
		border-radius: var(--border-radius-sm);
		color: var(--color-neutral);

		&:hover {
			background: var(--color-hover);
			color: var(--color-primary);
		}
	}
</style>

<script lang="ts">
	import Popup from '../popup/Popup.svelte'
	import RecipePage from '../../../routes/(pages)/recipe/[id]/+page.svelte'
	import type { ComponentProps } from 'svelte'

	let {
		data,
		onClose,
		animateFrom = null
	}: {
		data?: ComponentProps<typeof RecipePage>['data']
		onClose: () => void
		animateFrom?: HTMLElement | null
	} = $props()

	export const open = async () => {
		await popup.open()
		window.scrollTo(0, 0)
	}
	
	export const close = async () => {
		await popup.close()
	}

	let popup: Popup
</script>

<Popup {onClose} width="90vw" {animateFrom} bind:this={popup}>
	{#if data}
		<RecipePage {data} />
	{/if}
</Popup>

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

<script lang="ts">
	import Popup from '../popup/Popup.svelte'
	import RecipePage from '../../../routes/(pages)/recipe/[id]/+page.svelte'
	import type { ComponentProps } from 'svelte'
	import { untrack } from 'svelte'
	let {
		data,
		isOpen = $bindable(false),
		onClose,
		animateFrom = null
	}: {
		data?: ComponentProps<typeof RecipePage>['data']
		isOpen: boolean
		onClose: () => void
		animateFrom?: HTMLElement | null
	} = $props()

	$effect(() => {
		if (isOpen) {
			untrack(popup.open)
		} else {
			untrack(popup.close)
		}
	})

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

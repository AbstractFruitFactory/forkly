<script lang="ts">
	import Popup from '../popup/Popup.svelte'
	import ExternalLink from 'lucide-svelte/icons/external-link'
	import RecipePage from '../../../routes/(pages)/recipe/[id]/+page.svelte'
	import { goto } from '$app/navigation'
	import type { ComponentProps } from 'svelte'

	let {
		data,
		isOpen = $bindable(false),
		onClose
	}: {
		data?: ComponentProps<typeof RecipePage>['data']
		isOpen: boolean
		onClose: () => void
	} = $props()
</script>

<Popup {isOpen} {onClose} width="90vw">
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

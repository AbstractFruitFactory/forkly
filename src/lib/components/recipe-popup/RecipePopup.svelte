<script lang="ts">
	import Popup from '../popup/Popup.svelte'
	import ExternalLink from 'lucide-svelte/icons/external-link'
	import RecipePage from '../../../routes/(pages)/recipe/[id]/+page.svelte'

	export let data: any
	export let isOpen = false
	export let onClose: () => void = () => {}

	const url = data ? `/recipe/${data.id}` : ''
</script>

<Popup {isOpen} {onClose} width="90vw">
	{#if data}
		<div class="fullscreen-link">
			<a href={url} aria-label="Open full page"><ExternalLink size={20} /></a>
		</div>
		<RecipePage {data} />
	{/if}
</Popup>

<style lang="scss">
	.fullscreen-link {
		position: absolute;
		top: var(--spacing-sm);
		right: var(--spacing-sm);
		z-index: 1;
	}
</style>

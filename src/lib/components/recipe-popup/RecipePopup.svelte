<script lang="ts">
	import Popup from '../popup/Popup.svelte'
	import ExternalLink from 'lucide-svelte/icons/external-link'
	import RecipePage from '../../../routes/(pages)/recipe/[id]/+page.svelte'
	import { goto } from '$app/navigation'

	export let data: any
	export let isOpen = false
	export let onClose: () => void = () => {}

	const url = data ? `/recipe/${data.id}` : ''

	const openFullPage = (e: MouseEvent) => {
		if (!url) return
		if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return
		e.preventDefault()
		goto(url, { replaceState: true })
	}
</script>

<Popup {isOpen} {onClose} width="90vw">
	{#if data}
		<svelte:fragment slot="header-actions">
			<a href={url} aria-label="Open full page" class="fullscreen-link" on:click={openFullPage}>
				<ExternalLink size={20} />
			</a>
		</svelte:fragment>
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

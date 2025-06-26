<script lang="ts">
	import Popup from '../popup/Popup.svelte'
	import ExternalLink from 'lucide-svelte/icons/external-link'
	import RecipePage from '../../../routes/(pages)/recipe/[id]/+page.svelte'
	import { goto } from '$app/navigation'
	import { page } from '$app/state'

	export let data: any
	export let isOpen = false
	export let onClose: () => void = () => {}
	export let animateFrom: DOMRect | null = null

	let popupEl: HTMLDivElement | null = null

	const openFullPage = (e: MouseEvent) => {
		if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return
		e.preventDefault()
		goto(window.location.href, { replaceState: false })
	}
</script>

<Popup {isOpen} {onClose} width="90vw" bind:containerEl={popupEl} openFrom={animateFrom}>
	{#snippet headerActions()}
		<button aria-label="Open full page" class="fullscreen-link" onclick={openFullPage}>
			<ExternalLink size={20} />
		</button>
	{/snippet}
	<RecipePage {data} />
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

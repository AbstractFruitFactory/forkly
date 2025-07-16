<script lang="ts">
	import Popup from '$lib/components/popup/Popup.svelte'
	import RecipeScraper from './RecipeScraper.svelte'

	let {
		isOpen = $bindable(false),
		onClose
	}: {
		isOpen?: boolean
		onClose?: () => void
	} = $props()

	function handleClose() {
		isOpen = false
		onClose?.()
	}
</script>

<Popup 
	bind:isOpen 
	title="Import Recipe" 
	width="800px"
	{onClose}
>
	<div class="import-recipe-content">
		<RecipeScraper onClose={handleClose} />
	</div>
</Popup>

<style lang="scss">
	@import '$lib/global.scss';

	.import-recipe-content {
		max-height: 70vh;
		overflow-y: auto;
		padding: var(--spacing-lg);
	}
</style> 
<script lang="ts">
	import Bookmark from 'lucide-svelte/icons/bookmark'
	import FloatingActionButton from './FloatingActionButton.svelte'

	let { isActive = false, onClick }: { isActive?: boolean; onClick?: () => void } = $props()
</script>

<div class="save-button-container">
	<FloatingActionButton text={isActive ? 'Saved' : 'Save'} {onClick} {isActive}>
		<Bookmark />
	</FloatingActionButton>
</div>

<style lang="scss">
	.save-button-container {
		:global(.action-button.active > svg) {
			fill: var(--color-text);
		}
	}
</style>

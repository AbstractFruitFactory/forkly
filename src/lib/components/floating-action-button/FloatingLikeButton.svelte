<script lang="ts">
	import Heart from 'lucide-svelte/icons/heart'
	import FloatingActionButton from './FloatingActionButton.svelte'

	let { isActive = false, onClick }: { isActive?: boolean; onClick?: () => void } = $props()
</script>

<div class="like-button-container">
	<FloatingActionButton text={isActive ? 'Liked' : 'Like'} {onClick} {isActive}>
		<Heart />
	</FloatingActionButton>
</div>

<style lang="scss">
	.like-button-container {
		:global(.action-button.active) {
			background: var(--color-primary-dark);
			border-color: var(--color-primary);
		}
	}
</style>

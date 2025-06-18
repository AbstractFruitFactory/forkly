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
		:global(.action-button.active > svg) {
			color: var(--color-error);
			fill: var(--color-error);
			animation: like-pop 0.3s ease;
		}
	}

	@keyframes like-pop {
		0% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.3);
		}
		100% {
			transform: scale(1);
		}
	}
</style>

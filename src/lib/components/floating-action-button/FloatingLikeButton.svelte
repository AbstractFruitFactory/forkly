<script lang="ts">
	import Heart from 'lucide-svelte/icons/heart'
	import FloatingActionButton from './FloatingActionButton.svelte'
	import { formatNumberShort } from '$lib/utils/format'

	let {
		count = 0,
		isActive = false,
		onClick,
		loading = false
	}: { count?: number; isActive?: boolean; onClick?: () => void; loading?: boolean } = $props()

	const displayedCount = $derived(formatNumberShort(count))
</script>

<div class="like-button-container">
	<FloatingActionButton text={displayedCount} {onClick} {isActive} {loading}>
		<Heart />
	</FloatingActionButton>
</div>

<style lang="scss">
	.like-button-container {
		:global(.action-button.active > svg) {
			color: var(--color-error);
			fill: var(--color-error);
			stroke: var(--color-error);
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

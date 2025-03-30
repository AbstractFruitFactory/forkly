<script lang="ts">
	import Heart from 'lucide-svelte/icons/heart'
	import ActionButton from '$lib/components/action-button/ActionButton.svelte'

	let {
		count = 0,
		isLiked = false,
		interactive = false,
		onLike
	}: {
		count: number
		isLiked?: boolean
		interactive?: boolean
		onLike?: () => void
	} = $props()

	const formatLikes = (count: number): string => {
		if (count >= 10000) {
			return (count / 1000).toFixed(0) + 'K'
		} else if (count >= 1000) {
			return (count / 1000).toFixed(2) + 'K'
		}
		return count.toString()
	}

	const displayedCount = $derived(formatLikes(count))
</script>

<ActionButton
	isActive={isLiked}
	{interactive}
	onAction={onLike}
	icon={Heart}
	activeLabel={displayedCount}
	inactiveLabel={displayedCount}
	--active-color="var(--color-primary)"
	--active-bg-color="var(--color-primary-dark)"
/>

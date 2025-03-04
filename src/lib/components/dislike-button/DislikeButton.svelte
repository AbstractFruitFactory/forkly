<script lang="ts">
	import ThumbsDown from 'lucide-svelte/icons/thumbs-down'
	import ActionButton from '$lib/components/action-button/ActionButton.svelte'

	let {
		isDisliked = false,
		interactive = false,
		onDislike
	}: {
		isDisliked?: boolean
		interactive?: boolean
		onDislike?: () => void
	} = $props()
</script>

<ActionButton
	count={0}
	isActive={isDisliked}
	{interactive}
	onAction={onDislike}
	icon={ThumbsDown}
	activeLabel="Remove dislike"
	inactiveLabel="Dislike recipe"
	countLabel="dislikes"
	showCount={false}
	--active-color="var(--color-error)"
	--active-bg-color="var(--color-error-dark)"
/> 
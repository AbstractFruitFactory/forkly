<script lang="ts">
	import Bookmark from 'lucide-svelte/icons/bookmark'
	import ActionButton from '$lib/components/action-button/ActionButton.svelte'

	let {
		count = 0,
		isBookmarked = false,
		interactive = false,
		onBookmark
	}: {
		count: number
		isBookmarked?: boolean
		interactive?: boolean
		onBookmark?: () => void
	} = $props()
</script>

<ActionButton
	{count}
	isActive={isBookmarked}
	{interactive}
	onAction={onBookmark}
	icon={Bookmark}
	activeLabel="Remove bookmark"
	inactiveLabel="Bookmark recipe"
	countLabel="bookmarks"
	--active-color="var(--color-secondary)"
	--active-bg-color="var(--color-secondary-dark)"
/>

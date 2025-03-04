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
</script>

<ActionButton
	{count}
	isActive={isLiked}
	{interactive}
	onAction={onLike}
	icon={Heart}
	activeLabel="Unlike recipe"
	inactiveLabel="Like recipe"
	countLabel="likes"
	--active-color="var(--color-primary)"
	--active-bg-color="var(--color-primary-dark)"
/>

<script lang="ts">
	import Bookmark from 'lucide-svelte/icons/bookmark'
	import ActionButton from '$lib/components/action-button/ActionButton.svelte'

	let {
		count = 0,
		isSaved = false,
		interactive = false,
		onSave
	}: {
		count?: number
		isSaved?: boolean
		interactive?: boolean
		onSave?: () => void
	} = $props()
</script>

<ActionButton
	{count}
	isActive={isSaved}
	{interactive}
	onAction={onSave}
	icon={Bookmark}
	activeLabel="Unsave"
	inactiveLabel="Save"
	showCount={false}
/> 
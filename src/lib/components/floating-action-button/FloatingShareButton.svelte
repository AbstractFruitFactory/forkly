<script lang="ts">
	import Share2 from 'lucide-svelte/icons/share-2'
	import FloatingActionButton from './FloatingActionButton.svelte'

	let { onClick }: { onClick?: () => void } = $props()
</script>

<FloatingActionButton text="Share" onClick={onClick}>
	<Share2 />
</FloatingActionButton> 
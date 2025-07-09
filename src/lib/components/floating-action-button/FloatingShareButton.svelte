<script lang="ts">
	import Share from 'lucide-svelte/icons/share-2'
	import FloatingActionButton from './FloatingActionButton.svelte'

	let { onClick, loading = false }: { onClick?: () => void; loading?: boolean } = $props()
</script>

<FloatingActionButton text="Share" {onClick} {loading}>
	<Share />
</FloatingActionButton> 
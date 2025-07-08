<script lang="ts">
	import WarningBox from './WarningBox.svelte'

	let { message = 'A collection with this name already exists.' }: { message?: string } = $props()
</script>

<WarningBox {message} /> 
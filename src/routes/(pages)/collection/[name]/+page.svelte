<script lang="ts">
	import Collection from '$lib/pages/collection/Collection.svelte'

	let { data } = $props()
</script>

<Collection name={data.name} recipes={data.recipes} />
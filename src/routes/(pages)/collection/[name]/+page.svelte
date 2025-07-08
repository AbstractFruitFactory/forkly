<script lang="ts">
	import Collection from '$lib/pages/collection/Collection.svelte'
	import Skeleton from '$lib/components/skeleton/Skeleton.svelte'
	import { FLY_LEFT_IN, FLY_LEFT_OUT } from '$lib/utils/transitions.js'
	import { fly } from 'svelte/transition'

	let { data } = $props()

	let recipes: Awaited<ReturnType<typeof data.recipes>> = []
	let collections: Awaited<ReturnType<typeof data.collections>> = []
	let isLoading = $state(true)

	$effect(() => {
		const rp = data.recipes
		const cp = data.collections
		isLoading = true
		Promise.all([rp, cp]).then(([r, c]) => {
			recipes = r
			collections = c
			isLoading = false
		})
	})
</script>

<div class="collection" in:fly={FLY_LEFT_IN} out:fly={FLY_LEFT_OUT}>
	{#if isLoading}
		<Skeleton height="10rem" />
	{:else}
		<Collection name={data.name} {recipes} {collections} />
	{/if}
</div>

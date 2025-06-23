<script lang="ts">
	import { FLY_DOWN_IN, FLY_DOWN_OUT } from '$lib/utils/transitions'
	import { fly } from 'svelte/transition'

	let { children } = $props()
</script>

<div in:fly={FLY_DOWN_IN} out:fly={FLY_DOWN_OUT}>
	{@render children()}
</div>

<style>
	div {
		position: absolute;
		left: 0;
		right: 0;
		top: 0;
		bottom: 0;
		display: flex;
		justify-content: center;
		align-items: center;
	}
</style>

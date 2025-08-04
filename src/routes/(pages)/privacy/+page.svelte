<script lang="ts">
	import Privacy from '$lib/pages/privacy/Privacy.svelte'
	import { FLY_DOWN_IN, FLY_DOWN_OUT } from '$lib/utils/transitions'
	import { fly } from 'svelte/transition'

	export const prerender = true
</script>

<div in:fly|global={FLY_DOWN_IN} out:fly|global={FLY_DOWN_OUT}>
	<Privacy />
</div>

<script lang="ts">
	import { FLY_LEFT_IN, FLY_LEFT_OUT } from '$lib/utils/transitions'
	import { fly } from 'svelte/transition'

	let { children } = $props()
</script>

<div in:fly|global={FLY_LEFT_IN} out:fly|global={FLY_LEFT_OUT}>
	{@render children()}
</div>

<style lang="scss">
	@use '$lib/styles/tokens' as *;
	div {
		display: flex;
		justify-content: center;
		margin-top: 200px;

		@include mobile {
			height: calc(100dvh - 6.5rem);
			align-items: center;
			padding: var(--spacing-md);
			margin-top: 0;
		}
	}
</style>

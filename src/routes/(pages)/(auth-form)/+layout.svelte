<script lang="ts">
	import { FLY_DOWN_IN, FLY_DOWN_OUT } from '$lib/utils/transitions'
	import { fly } from 'svelte/transition'

	let { children } = $props()
</script>

<div in:fly|global={FLY_DOWN_IN} out:fly|global={FLY_DOWN_OUT}>
	{@render children()}
</div>

<style lang="scss">
	@import '$lib/global.scss';
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

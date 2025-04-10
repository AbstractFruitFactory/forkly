<script lang="ts">
	import { clickOutside } from '$lib/actions/clickOutside'
	import { fly } from 'svelte/transition'
	import type { Snippet } from 'svelte'

	let {
		isOpen = $bindable(false),
		children
	}: {
		isOpen?: boolean
		children: Snippet
	} = $props()

	const closeDropdown = () => {
		isOpen = false
	}
</script>

{#if isOpen}
	<div
		class="dropdown"
		use:clickOutside={{ callback: closeDropdown }}
		transition:fly={{ y: 10, duration: 200 }}
	>
		{@render children()}
	</div>
{/if}

<style lang="scss">
	.dropdown {
		position: absolute;
		top: 100%;
		left: 0;
		background-color: var(--color-neutral-dark);
		border-radius: var(--border-radius-lg);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
		z-index: 10;
		margin-top: var(--spacing-sm);
		overflow: hidden;
		border: 1px solid var(--color-neutral);
		min-width: 200px;
	}
</style>

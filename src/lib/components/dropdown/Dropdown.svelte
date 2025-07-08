<script lang="ts">
	import { clickOutside } from '$lib/actions/clickOutside'
	import { fly } from 'svelte/transition'
	import type { Snippet } from 'svelte'

	let {
		isOpen = $bindable(false),
		dropdownContent
	}: {
		isOpen?: boolean
		dropdownContent: Snippet<
			[item: (itemContent: Snippet, onclick: () => void) => ReturnType<Snippet>]
		>
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
		{@render dropdownContent(item)}
	</div>
{/if}

{#snippet item(itemContent: Snippet, onclick: () => void)}
	<button type="button" class="item" {onclick}>
		{@render itemContent()}
	</button>
{/snippet}

<style lang="scss">
	.dropdown {
		position: absolute;
		top: 100%;
		left: 0;
		background-color: var(--color-surface);
		border-radius: var(--border-radius-lg);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
		z-index: 10;
		margin-top: var(--spacing-sm);
		overflow: hidden;
		border: 1px solid var(--color-neutral-2);
		min-width: 200px;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-sm);
		padding: var(--spacing-sm) var(--spacing-md);
	}

	.item {
		padding: var(--spacing-sm) var(--spacing-md);
		margin: 0;
		border-radius: var(--border-radius-lg);
		transition: background-color 0.2s ease;
		cursor: pointer;
		color: var(--color-text-on-surface);
		width: 100%;
		text-align: left;

		&:hover {
			background-color: var(--color-secondary);
			color: var(--color-text-on-background);
		}
	}
</style>

<script lang="ts">
	import { slide } from 'svelte/transition'
	import { cubicOut } from 'svelte/easing'
	import type { Snippet } from 'svelte'

	let {
		isOpen = false,
		showChevron = true,
		headerClass = '',
		contentClass = '',
		transitionParams = { duration: 300, easing: cubicOut },
		header,
		children
	} = $props<{
		title?: string
		isOpen?: boolean
		showChevron?: boolean
		headerClass?: string
		contentClass?: string
		transitionParams?: { duration: number; easing: (t: number) => number }
		header?: Snippet
		children?: Snippet
	}>()

	let isExpanded = $state(isOpen)

	function toggle() {
		isExpanded = !isExpanded
	}
</script>

<div class="accordion">
	<button
		class="accordion-header {headerClass}"
		class:active={isExpanded}
		onclick={toggle}
		aria-expanded={isExpanded}
	>
		{@render header()}

		{#if showChevron}
			<svg
				class="chevron-icon"
				class:rotated={isExpanded}
				width="16"
				height="16"
				viewBox="0 0 24 24"
			>
				<path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
			</svg>
		{/if}
	</button>

	{#if isExpanded}
		<div class="accordion-content {contentClass}" transition:slide={transitionParams}>
			{@render children()}
		</div>
	{/if}
</div>

<style>
	.accordion {
		width: 100%;
		border-radius: var(--border-radius-md);
		overflow: hidden;
		margin-bottom: var(--spacing-sm);
		border: 1px solid var(--color-neutral-dark);
	}

	.accordion-header {
		display: flex;
		align-items: center;
		width: 100%;
		padding: var(--spacing-md);
		background: var(--color-neutral-darker);
		border: none;
		text-align: left;
		cursor: pointer;
		transition: background-color 0.2s ease;
	}

	.accordion-header:hover {
		background: var(--color-neutral-darkest);
	}

	.accordion-header.active {
		background: var(--color-neutral-darker);
		border-bottom: 1px solid var(--color-neutral);
	}

	.accordion-title {
		flex: 1;
		color: var(--color-neutral-light);
		font-weight: var(--font-weight-medium);
	}

	.chevron-icon {
		fill: var(--color-neutral-light);
		transition: transform 0.3s ease;
		flex-shrink: 0;
	}

	.chevron-icon.rotated {
		transform: rotate(180deg);
	}

	.accordion-content {
		background: var(--color-neutral-dark);
		padding: var(--spacing-md);
	}
</style>

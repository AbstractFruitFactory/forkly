<script lang="ts">
	import { clickOutside } from '$lib/actions/clickOutside'
	import { fly } from 'svelte/transition'
	import type { Snippet } from 'svelte'
	import { computePosition, autoUpdate, offset, flip, shift } from '@floating-ui/dom'
	import { onDestroy, tick } from 'svelte'

	let {
		isOpen = $bindable(false),
		dropdownContent,
		nbrOfItems,
		hasHighlight = $bindable(false)
	}: {
		isOpen?: boolean
		dropdownContent: Snippet<
			[item: (itemContent: Snippet, onclick: () => void, index: number) => ReturnType<Snippet>]
		>
		nbrOfItems: number
		hasHighlight?: boolean
	} = $props()

	let dropdownEl: HTMLElement | null = null
	let parentEl: HTMLElement | null = null
	let cleanup: (() => void) | undefined
	let selectedIndex = $state(-1)

	const closeDropdown = () => {
		isOpen = false
		selectedIndex = -1
	}

	$effect(() => {
		if (selectedIndex >= 0 && isOpen) {
			hasHighlight = true
		} else {
			hasHighlight = false
		}
	})

	const handleKeydown = (event: KeyboardEvent) => {
		if (!isOpen) return

		switch (event.key) {
			case 'ArrowDown':
				event.preventDefault()
				selectedIndex = selectedIndex < nbrOfItems - 1 ? selectedIndex + 1 : 0
				break
			case 'ArrowUp':
				event.preventDefault()
				selectedIndex = selectedIndex > 0 ? selectedIndex - 1 : nbrOfItems - 1
				break
			case 'Enter':
				event.preventDefault()
				if (selectedIndex >= 0 && selectedIndex < nbrOfItems) {
					const item = dropdownEl?.querySelectorAll('.item')[selectedIndex] as HTMLButtonElement
					if (item) {
						item.click()
					}
				}
				closeDropdown()
				break
			case 'Escape':
				event.preventDefault()
				closeDropdown()
				break
		}
	}

	async function updatePosition() {
		if (!parentEl || !dropdownEl) return
		const { x, y } = await computePosition(parentEl, dropdownEl, {
			placement: 'bottom-start',
			middleware: [offset(10), flip(), shift({ padding: 8 })]
		})

		dropdownEl.style.left = `${x}px`
		dropdownEl.style.top = `${y}px`
	}

	$effect(() => {
		if (isOpen && dropdownEl) {
			parentEl = dropdownEl.parentElement
			tick().then(() => {
				cleanup?.()
				cleanup = autoUpdate(parentEl!, dropdownEl!, updatePosition)
				updatePosition()
			})
		} else {
			cleanup?.()
		}
	})

	onDestroy(() => {
		cleanup?.()
	})
</script>

<svelte:document onkeydown={handleKeydown} />

{#if isOpen}
	<div
		bind:this={dropdownEl}
		class="dropdown"
		style="top: 0; left: 0;"
		use:clickOutside={{ callback: closeDropdown }}
		transition:fly={{ y: 10, duration: 200 }}
	>
		{@render dropdownContent(item)}
	</div>
{/if}

{#snippet item(itemContent: Snippet, onclick: () => void, index: number)}
	<button type="button" class="item" class:selected={selectedIndex === index} {onclick}>
		{@render itemContent()}
	</button>
{/snippet}

<style lang="scss">
	.dropdown {
		position: absolute;
		background-color: var(--color-surface);
		border-radius: var(--border-radius-lg);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
		z-index: 10;
		overflow: hidden;
		border: 1px solid var(--color-neutral-2);
		min-width: 200px;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-sm);
		padding: var(--spacing-sm);
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
			@extend .selected;
		}
	}

	.selected {
		background-color: var(--color-secondary);
		color: var(--color-text-on-background);
	}
</style>

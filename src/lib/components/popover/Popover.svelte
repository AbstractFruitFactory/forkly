<script lang="ts">
	import {
		computePosition,
		flip,
		shift,
		offset,
		arrow,
		autoUpdate,
		type Placement
	} from '@floating-ui/dom'
	import { fade } from 'svelte/transition'
	import type { Snippet } from 'svelte'

	let {
		placement = 'bottom',
		showArrow = true,
		offset: offsetDistance = 8,
		autoCloseDelay = 3000,
		type = 'default',
		trigger,
		content
	}: {
		placement?: Placement
		showArrow?: boolean
		offset?: number
		autoCloseDelay?: number
		type?: 'default' | 'warning'
		trigger: Snippet
		content: Snippet
	} = $props()

	let isOpen = $state(false)
	let reference: HTMLDivElement
	let floating: HTMLDivElement
	let arrowElement: HTMLDivElement
	let cleanup: (() => void) | undefined
	let autoCloseTimeout: ReturnType<typeof setTimeout>

	const togglePopover = () => {
		isOpen = true
	}

	$effect(() => {
		if (isOpen && reference && floating) {
			setupFloating()

			if (autoCloseDelay > 0) {
				clearTimeout(autoCloseTimeout)
				autoCloseTimeout = setTimeout(() => {
					isOpen = false
				}, autoCloseDelay)
			}
		}
		return () => {
			cleanup?.()
			clearTimeout(autoCloseTimeout)
		}
	})

	const setupFloating = () => {
		const update = () => {
			if (!reference || !floating) return

			computePosition(reference, floating, {
				placement,
				middleware: [
					offset(offsetDistance),
					flip(),
					shift({ padding: 5 }),
					showArrow && arrow({ element: arrowElement })
				].filter(Boolean)
			}).then(({ x, y, placement: updatedPlacement, middlewareData }) => {
				Object.assign(floating.style, {
					left: `${x}px`,
					top: `${y}px`
				})

				if (showArrow && middlewareData.arrow) {
					const { x: arrowX, y: arrowY } = middlewareData.arrow
					const staticSide = {
						top: 'bottom',
						right: 'left',
						bottom: 'top',
						left: 'right'
					}[updatedPlacement.split('-')[0]] as string

					Object.assign(arrowElement.style, {
						left: arrowX != null ? `${arrowX}px` : '',
						top: arrowY != null ? `${arrowY}px` : '',
						right: '',
						bottom: '',
						[staticSide]: '-4px'
					})
				}
			})
		}

		cleanup = autoUpdate(reference, floating, update)

		update()
	}

	const injectReference = (node: HTMLElement) => {
		const firstChild = node.firstElementChild as HTMLDivElement
		if (firstChild) {
			firstChild.addEventListener('click', togglePopover)
			reference = firstChild
		}
		return {
			destroy() {
				if (firstChild) {
					firstChild.removeEventListener('click', togglePopover)
				}
			}
		}
	}
</script>

<div use:injectReference>
	{@render trigger()}
</div>

{#if isOpen}
	<div
		class="popover"
		class:warning={type === 'warning'}
		bind:this={floating}
		transition:fade={{ duration: 100 }}
		role="tooltip"
	>
		{#if showArrow}
			<div class="arrow" bind:this={arrowElement}></div>
		{/if}

		{@render content()}
	</div>
{/if}

<style lang="scss">
	.popover {
		position: absolute;
		top: 0;
		left: 0;
		background: var(--color-background);
		border: var(--border-width-thin) solid var(--color-border);
		border-radius: var(--border-radius-md);
		box-shadow: var(--shadow-md);
		z-index: var(--z-popover);
		max-width: calc(100vw - 10px);
		padding: 0 var(--spacing-sm);
	}

	.arrow {
		position: absolute;
		background: var(--color-background);
		width: 8px;
		height: 8px;
		transform: rotate(45deg);
		border: var(--border-width-thin) solid var(--color-border);
		z-index: -1;
	}

	.warning {
		background: var(--color-error-light);
		border-color: var(--color-error-dark);

		.arrow {
			background: var(--color-error);
			border-color: var(--color-error-dark);
		}
	}
</style>

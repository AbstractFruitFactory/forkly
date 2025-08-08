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
		content,
		triggerOn = 'click',
		arrowPlacement
	}: {
		placement?: Placement
		showArrow?: boolean
		offset?: number
		autoCloseDelay?: number
		type?: 'default' | 'warning'
		trigger: Snippet
		content: Snippet
		triggerOn?: 'click' | 'hover' | 'none'
		arrowPlacement?: 'start' | 'center' | 'end'
	} = $props()

	let isOpen = $state(false)
	let reference = $state<HTMLElement>()
	let floating = $state<HTMLDivElement>()
	let arrowElement = $state<HTMLDivElement>()
	let cleanup: (() => void) | undefined
	let autoCloseTimeout: ReturnType<typeof setTimeout>

	export const openPopover = () => {
		isOpen = true
	}

	export const closePopover = () => {
		isOpen = false
	}

	$effect(() => {
		if (isOpen && reference && floating) {
			setupFloating()

			if (autoCloseDelay > 0 && triggerOn === 'click') {
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
			if (!reference || !floating || !arrowElement) return

			computePosition(reference, floating, {
				placement,
				middleware: [
					offset(offsetDistance),
					flip(),
					shift({ padding: 5 }),
					showArrow && arrow({ element: arrowElement })
				].filter(Boolean)
			}).then(({ x, y, placement: updatedPlacement, middlewareData }) => {
				Object.assign(floating!.style, {
					left: `${x}px`,
					top: `${y}px`
				})

				if (showArrow && middlewareData.arrow) {
					const { x: arrowX, y: arrowY } = middlewareData.arrow
					const side = updatedPlacement.split('-')[0]
					const staticSide = {
						top: 'bottom',
						right: 'left',
						bottom: 'top',
						left: 'right'
					}[side] as string

					let finalArrowX = arrowX
					let finalArrowY = arrowY

					if (arrowPlacement && arrowPlacement !== 'center') {
						const isVertical = side === 'top' || side === 'bottom'
						const isHorizontal = side === 'left' || side === 'right'

						if (isVertical) {
							const rect = floating!.getBoundingClientRect()
							const arrowSize = 8

							if (arrowPlacement === 'start') {
								finalArrowX = arrowSize
							} else if (arrowPlacement === 'end') {
								finalArrowX = rect.width - arrowSize
							}
						} else if (isHorizontal) {
							const rect = floating!.getBoundingClientRect()
							const arrowSize = 8

							if (arrowPlacement === 'start') {
								finalArrowY = arrowSize
							} else if (arrowPlacement === 'end') {
								finalArrowY = rect.height - arrowSize
							}
						}
					}

					Object.assign(arrowElement!.style, {
						left: finalArrowX != null ? `${finalArrowX}px` : '',
						top: finalArrowY != null ? `${finalArrowY}px` : '',
						right: '',
						bottom: '',
						[staticSide]: '-4px'
					})
				}
			})
		}

		cleanup = autoUpdate(reference!, floating!, update)

		update()
	}

	const injectReference = (node: HTMLElement) => {
		reference = node

		if (triggerOn === 'click') {
			node.addEventListener('click', openPopover)
		} else if (triggerOn === 'hover') {
			node.addEventListener('mouseenter', openPopover)
			node.addEventListener('mouseleave', closePopover)
		}

		return {
			destroy() {
				if (triggerOn === 'click') {
					node.removeEventListener('click', openPopover)
				} else if (triggerOn === 'hover') {
					node.removeEventListener('mouseenter', openPopover)
					node.removeEventListener('mouseleave', closePopover)
				}
			}
		}
	}
</script>

<span use:injectReference>
	{@render trigger()}
</span>

{#if isOpen}
	<div
		class="popover"
		class:warning={type === 'warning'}
		bind:this={floating}
		transition:fade={{ duration: 100 }}
		role="tooltip"
		onmouseleave={triggerOn === 'hover' ? closePopover : undefined}
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
		background: var(--color-error);
		border-color: var(--color-error-dark);

		.arrow {
			background: var(--color-error);
			border-color: var(--color-error-dark);
		}
	}
</style>

<script lang="ts">
	import Popup from '../popup/Popup.svelte'
	import ExternalLink from 'lucide-svelte/icons/external-link'
	import RecipePage from '../../../routes/(pages)/recipe/[id]/+page.svelte'
       import { goto } from '$app/navigation'
       import gsap from 'gsap'
	import type { ComponentProps } from 'svelte'

	let {
		data,
		isOpen = $bindable(false),
		onClose
	}: {
		data?: ComponentProps<typeof RecipePage>['data']
		isOpen: boolean
		onClose: () => void
	} = $props()

       const openFullPage = async (e: MouseEvent) => {
               if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return
               e.preventDefault()

               const overlay = document.querySelector<HTMLElement>('.popup-overlay')
               const container = overlay?.querySelector<HTMLElement>('.popup-container')
               const main = document.querySelector<HTMLElement>('.main')

               if (!overlay || !container || !main) {
                       goto(window.location.href, { replaceState: false })
                       return
               }

               const mainRect = main.getBoundingClientRect()
               const containerRect = container.getBoundingClientRect()

               gsap.set(container, {
                       position: 'fixed',
                       top: containerRect.top,
                       left: containerRect.left,
                       width: containerRect.width,
                       height: containerRect.height
               })

               const timeline = gsap.timeline({
                       onComplete: () => goto(window.location.href, { replaceState: false })
               })

               timeline.to(overlay, { backgroundColor: 'transparent', duration: 0.3 }, 0)
               timeline.to(
                       container,
                       {
                               top: mainRect.top,
                               left: mainRect.left,
                               width: mainRect.width,
                               height: mainRect.height,
                               borderRadius: 0,
                               duration: 0.3,
                               ease: 'power1.inOut'
                       },
                       0
               )
       }
</script>

<Popup {isOpen} {onClose} width="90vw">
	{#snippet headerActions()}
		<button aria-label="Open full page" class="fullscreen-link" onclick={openFullPage}>
			<ExternalLink size={20} />
		</button>
	{/snippet}
	{#if data}
		<RecipePage {data} />
	{/if}
</Popup>

<style lang="scss">
	.fullscreen-link {
		display: flex;
		align-items: center;
		padding: var(--spacing-xs);
		border-radius: var(--border-radius-sm);
		color: var(--color-neutral);

		&:hover {
			background: var(--color-hover);
			color: var(--color-primary);
		}
	}
</style>

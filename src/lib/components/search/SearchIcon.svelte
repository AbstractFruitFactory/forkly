<script lang="ts">
	import { tweened } from 'svelte/motion'
	import { cubicOut } from 'svelte/easing'

	interface Props {
		isClear?: boolean
		size?: number
		color?: string
	}

	let { isClear = false, size = 24 }: Props = $props()

	const morphProgress = tweened(0, {
		duration: 300,
		easing: cubicOut
	})

	$effect(() => {
		morphProgress.set(isClear ? 1 : 0)
	})

	function morphCircleToCross(progress: number): string {
		const t = progress

		if (t < 0.5) {
			const morphT = t * 2
			const radius = 8.5 - morphT * 8.5
			const centerX = 10.5
			const centerY = 10.5

			return `M${centerX + radius} ${centerY}C${centerX + radius} ${centerY + radius * 0.552} ${centerX + radius * 0.552} ${centerY + radius} ${centerX} ${centerY + radius}C${centerX - radius * 0.552} ${centerY + radius} ${centerX - radius} ${centerY + radius * 0.552} ${centerX - radius} ${centerY}C${centerX - radius} ${centerY - radius * 0.552} ${centerX - radius * 0.552} ${centerY - radius} ${centerX} ${centerY - radius}C${centerX + radius * 0.552} ${centerY - radius} ${centerX + radius} ${centerY - radius * 0.552} ${centerX + radius} ${centerY}Z`
		} else {
			const crossT = (t - 0.5) * 2
			const startX = 10.5 - crossT * 4.5
			const startY = 10.5 - crossT * 4.5
			const endX = 10.5 + crossT * 4.5
			const endY = 10.5 + crossT * 4.5

			return `M${startX} ${startY}L${endX} ${endY}M${10.5 + crossT * 4.5} ${10.5 - crossT * 4.5}L${10.5 - crossT * 4.5} ${10.5 + crossT * 4.5}`
		}
	}

	function morphHandle(progress: number): string {
		const t = progress

		if (t < 0.5) {
			const morphT = t * 2
			const startX = 21 - morphT * 3
			const startY = 21 - morphT * 15
			const endX = 16.514 - morphT * 10.514
			const endY = 16.506 - morphT * 10.506

			return `M${startX} ${startY}L${endX} ${endY}L${startX} ${startY}Z`
		} else {
			return ''
		}
	}
</script>

<svg
	class="search-icon"
	data-flip-id="search-icon"
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	xmlns="http://www.w3.org/2000/svg"
>
	<path
		d={morphCircleToCross($morphProgress)}
		stroke={'white'}
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
	/>
	{#if $morphProgress < 0.5}
		<path
			d={morphHandle($morphProgress)}
			stroke={'white'}
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
	{/if}
</svg>

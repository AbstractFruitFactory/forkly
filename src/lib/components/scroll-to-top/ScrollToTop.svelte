<script lang="ts">
	import ArrowUp from 'lucide-svelte/icons/arrow-up'
	import FloatingActionButton from '../floating-action-button/FloatingActionButton.svelte'
	import { fly } from 'svelte/transition'

	const scrollToTop = () => {
		window.scrollTo({ top: 0, behavior: 'smooth' })
	}
</script>

<div class="scroll-to-top" transition:fly={{ y: -100, duration: 300 }}>
	<FloatingActionButton text="Back to top" onClick={scrollToTop}>
		<ArrowUp />
	</FloatingActionButton>
</div>

<style lang="scss">
	.scroll-to-top {
		z-index: var(--z-fixed);
	}
</style>

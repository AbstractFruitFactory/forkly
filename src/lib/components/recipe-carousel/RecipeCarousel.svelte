<script lang="ts">
	import RecipeCard from '$lib/components/recipe-card/RecipeCard.svelte'
	import type { Recipe } from '$lib/pages/home/Home.svelte'
	import { onMount } from 'svelte'

	let { recipes, loadMore }: { recipes: Recipe[]; loadMore?: () => Promise<void> } = $props()

	let isLoading = $state(false)
	let carouselRef: HTMLDivElement

	const handleScroll = () => {
		if (!carouselRef || !loadMore || isLoading) return

		const { scrollLeft, scrollWidth, clientWidth } = carouselRef
		const threshold = 2 // Load more when we're 2 slides away from the end
		const slideWidth = clientWidth
		const totalSlides = Math.floor(scrollWidth / slideWidth)
		const currentSlide = Math.round(scrollLeft / slideWidth)

		if (currentSlide >= totalSlides - threshold) {
			isLoading = true
			loadMore().finally(() => {
				isLoading = false
			})
		}
	}

	onMount(() => {
		carouselRef.addEventListener('scroll', handleScroll)
		return () => carouselRef.removeEventListener('scroll', handleScroll)
	})
</script>

<div class="recipe-carousel">
	<div class="carousel-container" bind:this={carouselRef}>
		<div class="slide placeholder" />
		{#each recipes as recipe}
			<div class="slide">
				<RecipeCard {recipe} />
			</div>
		{/each}
		<div class="slide placeholder" />
	</div>
</div>

<style>
	.recipe-carousel {
		width: 100%;
		overflow: hidden;
	}

	.carousel-container {
		display: flex;
		overflow-x: auto;
		scroll-snap-type: x mandatory;
		scroll-behavior: smooth;
		-webkit-overflow-scrolling: touch;
		width: 100%;
		gap: var(--spacing-lg);
		padding: 0 var(--spacing-md);
	}

	.slide {
		flex: 0 0 80%;
	}

	.slide:not(.placeholder) {
		scroll-snap-align: center;
		scroll-snap-stop: always;
	}

	.placeholder {
		visibility: hidden;
		pointer-events: none;
	}

	.carousel-container::-webkit-scrollbar {
		display: none;
	}

	.carousel-container {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
</style>

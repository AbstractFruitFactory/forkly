<script lang="ts">
	import Play from 'lucide-svelte/icons/play'
	import ChevronLeft from 'lucide-svelte/icons/chevron-left'
	import ChevronRight from 'lucide-svelte/icons/chevron-right'
	import MediaPlayer from '$lib/components/media-player/MediaPlayer.svelte'

	type Media = {
		mediaUrl?: string
		mediaType?: 'image' | 'video'
	}

	let {
		mainImageUrl,
		media,
		aspectRatio = '1/1',
		autoplay = false
	} = $props<{
		mainImageUrl?: string
		media: Media[]
		aspectRatio?: string
		autoplay?: boolean
	}>()

	// Video player and slideshow state
	let videoPlayerVisible = $state(false)
	let currentSlideIndex = $state(0)

	// Transform recipe instructions with media into format for MediaPlayer
	const instructionMedia = $derived<
		Array<{ type: 'image' | 'video'; url: string; duration?: number }>
	>([
		// Add main recipe image as first slide if it exists
		...(mainImageUrl ? [{ type: 'image' as const, url: mainImageUrl }] : []),
		// Then add instruction media
		...media
			.filter(
				(
					instruction: Media
				): instruction is Media & { mediaUrl: string; mediaType: 'image' | 'video' } =>
					!!instruction.mediaUrl &&
					!!instruction.mediaType &&
					(instruction.mediaType === 'image' || instruction.mediaType === 'video')
			)
			.map((instruction: Media & { mediaUrl: string; mediaType: 'image' | 'video' }) => ({
				type: instruction.mediaType,
				url: instruction.mediaUrl,
				duration: 3000 // Default duration for slideshow
			}))
	])

	// Check if we only have images (including main recipe image)
	const hasOnlyImages = $derived(instructionMedia.every((media) => media.type === 'image'))
	const hasVideos = $derived(instructionMedia.some((media) => media.type === 'video'))

	$effect(() => {
		if (autoplay && hasVideos) {
			videoPlayerVisible = true
		} else if (!autoplay) {
			videoPlayerVisible = false
		}
	})

	function toggleVideoPlayer() {
		videoPlayerVisible = !videoPlayerVisible
	}

	function nextSlide() {
		if (currentSlideIndex < instructionMedia.length - 1) {
			currentSlideIndex = currentSlideIndex + 1
		}
	}

	function prevSlide() {
		if (currentSlideIndex > 0) {
			currentSlideIndex = currentSlideIndex - 1
		}
	}
</script>

<div class="recipe-media" style:aspect-ratio={aspectRatio}>
	{#if hasOnlyImages}
		<div class="slideshow-container">
			<div class="slides-wrapper" style="transform: translateX(-{currentSlideIndex * 100}%)">
				{#each instructionMedia as media}
					<div class="slide">
						<img src={media.url} alt="Recipe" />
					</div>
				{/each}
			</div>
		</div>
		{#if instructionMedia.length > 1}
			<div class="slideshow-controls">
				<button
					class="slideshow-button prev"
					onclick={prevSlide}
					disabled={currentSlideIndex === 0}
				>
					<svelte:component this={ChevronLeft} size={24} color="white" />
				</button>
				<button
					class="slideshow-button next"
					onclick={nextSlide}
					disabled={currentSlideIndex === instructionMedia.length - 1}
				>
					<svelte:component this={ChevronRight} size={24} color="white" />
				</button>
			</div>
			<div class="slideshow-dots">
				{#each instructionMedia as _, index}
					<button
						class="dot {currentSlideIndex === index ? 'active' : ''}"
						onclick={() => (currentSlideIndex = index)}
					></button>
				{/each}
			</div>
		{/if}
	{:else}
		<div class="slideshow-container">
			{#if videoPlayerVisible}
				<div class="video-player-container">
					<button class="close-button" onclick={toggleVideoPlayer}>
						<svg width="24" height="24" viewBox="0 0 24 24">
							<path
								d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
							/>
						</svg>
					</button>
					<div class="video-player-content">
						<MediaPlayer {instructionMedia} />
					</div>
				</div>
			{:else}
				<div class="slide">
					<img src={instructionMedia[0].url} alt="Recipe" />
				</div>
				{#if hasVideos && !autoplay}
					<button class="play-button" onclick={toggleVideoPlayer}>
						<svelte:component this={Play} size={28} color="white" />
					</button>
				{/if}
			{/if}
		</div>
	{/if}
</div>

<style lang="scss">
	@import '$lib/global.scss';

	.recipe-media {
		position: relative;
		width: 100%;
		height: 100%;
		overflow: hidden;
		border-radius: var(--border-radius-lg);
		box-shadow: var(--shadow-md);
		background: var(--color-neutral-dark);
	}

	.slideshow-container {
		width: 100%;
		height: 100%;
		overflow: hidden;
	}

	.slides-wrapper {
		display: flex;
		width: 100%;
		height: 100%;
		transition: transform 0.3s ease-in-out;
	}

	.slide {
		flex: 0 0 100%;
		width: 100%;
		height: 100%;

		img {
			width: 100%;
			height: 100%;
			object-fit: cover;
		}
	}

	.play-button {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		background: rgba(0, 0, 0, 0.3);
		border: none;
		border-radius: var(--border-radius-full);
		width: 56px;
		height: 56px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		backdrop-filter: blur(2px);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
		z-index: var(--z-elevated);
		transition: all var(--transition-fast) var(--ease-in-out);

		&:hover {
			background: rgba(0, 0, 0, 0.5);
			transform: translate(-50%, -50%) scale(1.05);
		}

		&:active {
			transform: translate(-50%, -50%) scale(0.95);
		}
	}

	.video-player-container {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: var(--color-neutral-darker);
		z-index: var(--z-elevated);
	}

	.video-player-content {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.close-button {
		position: absolute;
		top: var(--spacing-md);
		right: var(--spacing-md);
		background: rgba(0, 0, 0, 0.5);
		border: none;
		border-radius: var(--border-radius-full);
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		z-index: var(--z-sticky);
		transition: all var(--transition-fast) var(--ease-in-out);
		backdrop-filter: blur(4px);

		&:hover {
			background: rgba(0, 0, 0, 0.7);
			transform: scale(1.05);
		}

		&:active {
			transform: scale(0.95);
		}

		svg {
			fill: white;
			width: 20px;
			height: 20px;
		}
	}

	.slideshow-controls {
		position: absolute;
		top: 50%;
		left: 0;
		right: 0;
		transform: translateY(-50%);
		display: flex;
		justify-content: space-between;
		padding: 0 var(--spacing-md);
		pointer-events: none;
	}

	.slideshow-button {
		background: rgba(0, 0, 0, 0.5);
		border: none;
		border-radius: var(--border-radius-full);
		width: 40px;
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		pointer-events: auto;
		transition: all var(--transition-fast) var(--ease-in-out);

		&:disabled {
			opacity: 0.3;
			cursor: not-allowed;
			pointer-events: none;
		}

		&:not(:disabled) {
			&:hover {
				background: rgba(0, 0, 0, 0.7);
				transform: scale(1.05);
			}

			&:active {
				transform: scale(0.95);
			}
		}
	}

	.slideshow-dots {
		position: absolute;
		bottom: var(--spacing-md);
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		gap: var(--spacing-xs);
		z-index: 5;
	}

	.dot {
		width: 8px;
		height: 8px;
		border-radius: var(--border-radius-full);
		background: rgba(255, 255, 255, 0.5);
		border: none;
		padding: 0;
		cursor: pointer;
		transition: all var(--transition-fast) var(--ease-in-out);

		&.active {
			background: white;
			transform: scale(1.2);
		}

		&:hover {
			background: rgba(255, 255, 255, 0.8);
		}
	}
</style>

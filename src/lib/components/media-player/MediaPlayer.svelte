<script lang="ts">
	import { onMount } from 'svelte'

	let {
		instructionMedia
	}: {
		instructionMedia: Array<{ type: 'image' | 'video'; url: string; duration?: number }>
	} = $props()

	// Video player state
	let currentInstructionIndex = $state(0)
	let videoError = $state(false)
	let videoElements: Array<HTMLVideoElement | null> = []
	let preloadedReady: boolean[] = []

	function handleVideoEnded() {
		const nextIndex = (currentInstructionIndex + 1) % instructionMedia.length
		const nextMedia = instructionMedia[nextIndex]

		const showNext = () => {
			const previousIndex = currentInstructionIndex
			currentInstructionIndex = nextIndex
			videoError = false

			if (instructionMedia[previousIndex].type === 'video') {
				const prevVid = videoElements[previousIndex]
				prevVid?.pause()
				prevVid && (prevVid.currentTime = 0)
			}

			if (instructionMedia[currentInstructionIndex].type === 'video') {
				const nextVid = videoElements[currentInstructionIndex]
				nextVid?.play()
			} else {
				setTimeout(() => {
					handleVideoEnded()
				}, instructionMedia[currentInstructionIndex].duration)
			}
		}

		if (nextMedia.type === 'video' && !preloadedReady[nextIndex]) {
			const vid = videoElements[nextIndex]
			if (vid) {
				const onReady = () => {
					vid.removeEventListener('loadeddata', onReady)
					preloadedReady[nextIndex] = true
					showNext()
				}
				vid.addEventListener('loadeddata', onReady)
				vid.load()
			}
		} else {
			showNext()
		}
	}

	function handleVideoError() {
		videoError = true
		const currentVid = videoElements[currentInstructionIndex]
		if (currentVid) {
			setTimeout(() => {
				currentVid.load()
				currentVid.play().catch(() => {})
			}, 1000)
		}
	}

	function handleVideoLoaded(index: number) {
		videoError = false
		if (instructionMedia[index].type === 'video') {
			preloadedReady[index] = true
		}
	}

	onMount(() => {
		instructionMedia.forEach((media, index) => {
			if (media.type === 'video') {
				const vid = videoElements[index]
				if (vid) {
					vid.preload = 'auto'
					vid.load()
					preloadedReady[index] = vid.readyState >= 2
				}
			} else {
				preloadedReady[index] = true
			}
		})

		if (instructionMedia[0].type === 'image') {
			setTimeout(() => {
				handleVideoEnded()
			}, instructionMedia[0].duration)
		} else {
			const first = videoElements[0]
			if (first) {
				if (preloadedReady[0]) {
					first.play()
				} else {
					const onReady = () => {
						first.removeEventListener('loadeddata', onReady)
						preloadedReady[0] = true
						first.play()
					}
					first.addEventListener('loadeddata', onReady)
				}
			}
		}

		return () => {
			// Clean up any timers when component is destroyed
		}
	})
</script>

<div class="media-player">
	{#each instructionMedia as media, index}
		{#if media.type === 'video'}
			<video
				bind:this={videoElements[index]}
				src={media.url}
				playsinline
				muted={true}
				preload="auto"
				loop={false}
				onended={index === currentInstructionIndex ? handleVideoEnded : undefined}
				onerror={index === currentInstructionIndex ? handleVideoError : undefined}
				onloadeddata={() => handleVideoLoaded(index)}
				style="display: {index === currentInstructionIndex ? 'block' : 'none'}"
				class="media-content"
			></video>
		{:else}
			<img
				src={media.url}
				alt="Cooking instruction"
				style="display: {index === currentInstructionIndex ? 'block' : 'none'}"
				class="media-content"
			/>
		{/if}
	{/each}
	{#if videoError}
		<div class="video-error">
			<p>Video loading error. Retrying...</p>
		</div>
	{/if}
</div>

<style>
	.media-player {
		width: 100%;
		height: 100%;
		position: relative;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}

	.media-content {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.video-error {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		background: rgba(0, 0, 0, 0.7);
		color: white;
		text-align: center;
		padding: 1rem;
	}
</style>

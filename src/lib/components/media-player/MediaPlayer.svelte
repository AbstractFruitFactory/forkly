<script lang="ts">
	import { onMount } from 'svelte'

	let {
		instructionMedia
	}: {
		instructionMedia: Array<{ type: 'image' | 'video'; url: string; duration?: number }>
	} = $props()

	// Video player state
        let videoElement: HTMLVideoElement
        let currentInstructionIndex = $state(0)
        let slideshow: ReturnType<typeof setInterval> | null = null
        let videoLoaded = $state(false)
        let videoError = $state(false)
        let preloadedVideos: Array<HTMLVideoElement | null> = []
        let preloadedReady: boolean[] = []

        function handleVideoEnded() {
                // Move to the next instruction media
                currentInstructionIndex = (currentInstructionIndex + 1) % instructionMedia.length
                videoError = false
                videoLoaded =
                        instructionMedia[currentInstructionIndex].type === 'video'
                                ? !!preloadedReady[currentInstructionIndex]
                                : true

                // If it's an image, set a timeout to move to the next one
                if (instructionMedia[currentInstructionIndex].type === 'image') {
                        setTimeout(() => {
                                handleVideoEnded()
			}, instructionMedia[currentInstructionIndex].duration)
		}
	}

	function handleVideoError() {
		videoError = true
		// Try to reload the video
		if (videoElement) {
			setTimeout(() => {
				videoElement.load()
			}, 1000)
		}
	}

        function handleVideoLoaded() {
                videoLoaded = true
                videoError = false
                if (instructionMedia[currentInstructionIndex].type === 'video') {
                        preloadedReady[currentInstructionIndex] = true
                }
        }

        onMount(() => {
                instructionMedia.forEach((media, index) => {
                        if (media.type === 'video') {
                                const vid = document.createElement('video')
                                vid.src = media.url
                                vid.preload = 'auto'
                                preloadedVideos[index] = vid
                                preloadedReady[index] = vid.readyState >= 2
                                vid.addEventListener('loadeddata', () => {
                                        preloadedReady[index] = true
                                })
                        } else {
                                preloadedVideos[index] = null
                                preloadedReady[index] = true
                        }
                })

                // Start the slideshow if the first item is an image
                if (instructionMedia[0].type === 'image') {
                        setTimeout(() => {
                                handleVideoEnded()
                        }, instructionMedia[0].duration)
		}

		return () => {
			// Clean up any timers when component is destroyed
			if (slideshow) clearTimeout(slideshow);
		};
	})
</script>

<div class="media-player">
	{#if instructionMedia[currentInstructionIndex].type === 'video'}
		<video
			bind:this={videoElement}
			src={instructionMedia[currentInstructionIndex].url}
			autoplay={true}
			preload="auto"
			muted={true}
			loop={false}
			playsinline
			data-webkit-playsinline="true"
			onended={handleVideoEnded}
			onerror={handleVideoError}
			onloadeddata={handleVideoLoaded}
			onclick={(e) => e.preventDefault()}
			class="media-content"
		></video>
		{#if videoError}
			<div class="video-error">
				<p>Video loading error. Retrying...</p>
			</div>
		{/if}
		{#if !videoLoaded && !videoError}
			<div class="video-loading">
				<div class="spinner"></div>
			</div>
		{/if}
	{:else if instructionMedia[currentInstructionIndex].type === 'image'}
		<img
			src={instructionMedia[currentInstructionIndex].url}
			alt="Cooking instruction"
			class="media-content"
		/>
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
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.video-error, 
	.video-loading {
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

	.spinner {
		width: 40px;
		height: 40px;
		border: 4px solid rgba(255, 255, 255, 0.3);
		border-radius: 50%;
		border-top-color: white;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}
</style>

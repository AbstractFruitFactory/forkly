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
       let videoLoaded = $state(false)
       let videoError = $state(false)
        let preloadedVideos: Array<HTMLVideoElement | null> = []
        let preloadedReady: boolean[] = []

       function handleVideoEnded() {
               const nextIndex = (currentInstructionIndex + 1) % instructionMedia.length
               const nextMedia = instructionMedia[nextIndex]

               const showNext = () => {
                       currentInstructionIndex = nextIndex
                       videoError = false
                       videoLoaded = nextMedia.type === 'video' ? !!preloadedReady[nextIndex] : true

                       if (instructionMedia[currentInstructionIndex].type === 'image') {
                               setTimeout(() => {
                                       handleVideoEnded()
                               }, instructionMedia[currentInstructionIndex].duration)
                       }
               }

               if (nextMedia.type === 'video' && !preloadedReady[nextIndex]) {
                       const vid = preloadedVideos[nextIndex]
                       if (vid) {
                               const onReady = () => {
                                       vid.removeEventListener('loadeddata', onReady)
                                       preloadedReady[nextIndex] = true
                                       showNext()
                               }
                               vid.addEventListener('loadeddata', onReady)
                       }
               } else {
                       showNext()
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

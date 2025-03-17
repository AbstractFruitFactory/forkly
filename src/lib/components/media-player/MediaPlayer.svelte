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

	function handleVideoEnded() {
		// Move to the next instruction media
		currentInstructionIndex = (currentInstructionIndex + 1) % instructionMedia.length

		// If it's an image, set a timeout to move to the next one
		if (instructionMedia[currentInstructionIndex].type === 'image') {
			setTimeout(() => {
				handleVideoEnded()
			}, instructionMedia[currentInstructionIndex].duration)
		}
	}

	onMount(() => {
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
			muted={true}
			loop={false}
			on:ended={handleVideoEnded}
			class="media-content"
		></video>
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
</style>

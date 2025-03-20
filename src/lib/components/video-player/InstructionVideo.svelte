<script lang="ts">
	let { src, stepNumber } = $props<{
		src: string
		stepNumber: number
	}>()

	let videoElement: HTMLVideoElement
	let videoLoaded = $state(false)
	let videoError = $state(false)

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
	}
</script>

<div class="video-container">
	<video
		bind:this={videoElement}
		{src}
		autoplay
		loop
		muted
		playsinline
		data-webkit-playsinline="true"
		class="video-content"
		onerror={handleVideoError}
		onloadeddata={handleVideoLoaded}
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
</div>

<style lang="scss">
	@import '$lib/global.scss';

	.video-container {
		position: relative;
		width: 100%;
		height: 100%;
		border-radius: var(--border-radius-md);
		overflow: hidden;
	}

	.video-content {
		width: 100%;
		display: block;
		border-radius: var(--border-radius-md);
		aspect-ratio: 16 / 9;
		object-fit: cover;
		will-change: transform;
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
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
</style> 
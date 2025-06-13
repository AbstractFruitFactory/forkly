<script lang="ts">
	import type { RecipeData } from '$lib/types'
	import Button from '$lib/components/button/Button.svelte'
	import Popup from '$lib/components/popup/Popup.svelte'

	let {
		instructions,
		isOpen = $bindable(false)
	}: {
		instructions: RecipeData['instructions']
		isOpen: boolean
	} = $props()

	let currentStep = $state(0)
	let videoLoaded = $state(false)
	let videoError = $state(false)

	function handleCookingVideoError() {
		videoError = true
		// Try to reload the video
		setTimeout(() => {
			const video = document.querySelector('.cooking-media video') as HTMLVideoElement
			if (video) {
				video.load()
			}
		}, 1000)
	}

	function handleCookingVideoLoaded() {
		videoLoaded = true
		videoError = false
	}

	function nextStep(e: Event) {
		e.preventDefault()
		if (currentStep < instructions.length - 1) {
			currentStep++
			videoLoaded = false
			videoError = false
		} else {
			isOpen = false
		}
	}

	function prevStep(e: Event) {
		e.preventDefault()
		if (currentStep > 0) {
			currentStep--
			videoLoaded = false
			videoError = false
		}
	}

	// Swipe handling for cooking mode
	let touchStartX = 0
	let touchEndX = 0

	function handleCookingTouchStart(e: TouchEvent) {
		touchStartX = e.touches[0].clientX
	}

	function handleCookingTouchMove(e: TouchEvent) {
		touchEndX = e.touches[0].clientX
	}

	function handleCookingTouchEnd(e: TouchEvent) {
		e.preventDefault()
		if (touchStartX - touchEndX > 50) {
			// Swipe left - next step
			nextStep(e)
		} else if (touchEndX - touchStartX > 50) {
			// Swipe right - previous step
			prevStep(e)
		}
		// Reset values
		touchStartX = 0
		touchEndX = 0
	}
</script>

<Popup bind:isOpen onClose={() => (isOpen = false)} width="800px">
	<div class="cooking-mode">
		<div class="cooking-progress">
			<div class="cooking-progress-text">
				Step {currentStep + 1} of {instructions.length}
			</div>
			<div class="cooking-progress-bar">
				<div
					class="cooking-progress-fill"
					style="width: {((currentStep + 1) / instructions.length) * 100}%"
				></div>
			</div>
		</div>

		<div
			class="cooking-content"
			ontouchstart={handleCookingTouchStart}
			ontouchmove={handleCookingTouchMove}
			ontouchend={handleCookingTouchEnd}
		>
			{#if instructions[currentStep].mediaUrl}
				<div class="cooking-media">
					{#if instructions[currentStep].mediaType === 'video'}
						<video
							src={instructions[currentStep].mediaUrl}
							autoplay
							loop
							muted
							playsinline
							data-webkit-playsinline="true"
							preload="auto"
							class="cooking-media-content"
							onerror={handleCookingVideoError}
							onloadeddata={handleCookingVideoLoaded}
							onclick={(e) => e.preventDefault()}
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
					{:else if instructions[currentStep].mediaType === 'image'}
						<img
							src={instructions[currentStep].mediaUrl}
							alt="Step {currentStep + 1}"
							class="cooking-media-content"
						/>
					{/if}
				</div>
			{/if}

			<div class="cooking-instruction">
				<p class="cooking-instruction-text">{instructions[currentStep].text}</p>
			</div>
		</div>

		<div class="cooking-navigation">
			{#if currentStep > 0}
				<Button variant="text" onclick={prevStep}>
					<svg width="24" height="24" viewBox="0 0 24 24" class="nav-icon">
						<path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
					</svg>
					Previous
				</Button>
			{:else}
				<div class="cooking-nav-button"></div>
			{/if}
			<Button
				color={currentStep === instructions.length - 1 ? 'secondary' : undefined}
				variant="text"
				onclick={nextStep}
			>
				{currentStep === instructions.length - 1 ? 'Done' : 'Next'}
				{#if currentStep < instructions.length - 1}
					<svg width="24" height="24" viewBox="0 0 24 24" class="nav-icon">
						<path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
					</svg>
				{/if}
			</Button>
		</div>
	</div>
</Popup>

<style lang="scss">
	@import '$lib/global.scss';

	.cooking-mode {
		display: flex;
		flex-direction: column;
		height: 600px;
		background: var(--color-background);

		@include mobile {
			height: 100dvh;
		}
	}

	.cooking-progress {
		padding: var(--spacing-md);
		background: var(--color-neutral-darker);
		border-radius: var(--border-radius-lg) var(--border-radius-lg) 0 0;
	}

	.cooking-progress-text {
		font-size: var(--font-size-sm);
		color: var(--color-neutral-light);
		margin-bottom: var(--spacing-xs);
	}

	.cooking-progress-bar {
		height: 2px;
		background: rgba(255, 255, 255, 0.2);
		border-radius: var(--border-radius-full);
		overflow: hidden;
	}

	.cooking-progress-fill {
		height: 100%;
		background: var(--color-primary);
		transition: width 0.3s ease;
	}

	.cooking-content {
		flex: 1;
		overflow-y: auto;
		padding: var(--spacing-md);
		display: flex;
		flex-direction: column;
		gap: var(--spacing-lg);
		height: 0; // This ensures the flex container respects the parent height
	}

	.cooking-media {
		width: 100%;
		height: 300px;
		background: var(--color-neutral-dark);
		border-radius: var(--border-radius-lg);
		overflow: hidden;
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.cooking-media-content {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.cooking-instruction {
		display: flex;
		gap: var(--spacing-md);
		padding: var(--spacing-md);
		background: var(--color-neutral-darker);
		border-radius: var(--border-radius-lg);
		min-height: 100px;
	}

	.cooking-instruction-text {
		font-size: var(--font-size-md);
		color: var(--color-neutral-light);
		line-height: 1.6;
	}

	.cooking-navigation {
		display: flex;
		justify-content: space-between;
		padding: var(--spacing-md);
		border-top: 1px solid var(--color-neutral-dark);
		background: var(--color-neutral-dark);
		gap: var(--spacing-md);
		border-radius: 0 0 var(--border-radius-lg) var(--border-radius-lg);

		:global(.nav-button) {
			display: flex;
			align-items: center;
			gap: var(--spacing-xs);
		}

		:global(.nav-icon) {
			fill: currentColor;
		}
	}

	.cooking-nav-button {
		display: flex;
		align-items: center;
		gap: var(--spacing-xs);
		background: var(--color-neutral-darker);
		border: none;
		border-radius: var(--border-radius-md);
		padding: var(--spacing-md) var(--spacing-lg);
		color: var(--color-neutral-light);
		font-weight: var(--font-weight-medium);
		cursor: pointer;
		transition: all var(--transition-fast) var(--ease-in-out);
	}

	.cooking-nav-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
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

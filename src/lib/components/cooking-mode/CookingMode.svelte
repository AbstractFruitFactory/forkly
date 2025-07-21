<script lang="ts">
	import type { Instruction } from '$lib/types'
	import Button from '$lib/components/button/Button.svelte'
	import Popup from '$lib/components/popup/Popup.svelte'
	import ChevronLeft from 'lucide-svelte/icons/chevron-left'
	import ChevronRight from 'lucide-svelte/icons/chevron-right'

	let {
		instructions,
		isOpen = $bindable(false)
	}: {
		instructions: Instruction[]
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

			{#if instructions[currentStep]}
				{@const step = instructions[currentStep]}
				<div>
					<h3>Step {currentStep + 1}</h3>
					{#if step.ingredients && step.ingredients.length > 0}
						<div class="step-ingredients">
							<h4>Ingredients needed:</h4>
							<ul class="ingredients-list">
								{#each step.ingredients ?? [] as ingredient}
									<li class="ingredient-item">
										<span class="ingredient-quantity">
											{ingredient.quantity}
											{ingredient.measurement}
										</span>
										<span class="ingredient-name">
											{ingredient.displayName}
										</span>
									</li>
								{/each}
							</ul>
						</div>
					{/if}
					<p>{step.text}</p>
				</div>
			{/if}
		</div>

		<div class="cooking-navigation">
			<Button color="primary" onclick={prevStep} disabled={currentStep === 0}>
				<ChevronLeft color="black" />
			</Button>

			<div class="cooking-step-text">
				Step {currentStep + 1} of {instructions.length}
			</div>

			<Button color="primary" onclick={nextStep}>
				{#if currentStep < instructions.length - 1}
					<ChevronRight color="black" />
				{:else}
					Done
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
			height: 100%;
			justify-content: space-between;
		}
	}

	.cooking-content {
		flex: 1;
		overflow-y: auto;
		padding: var(--spacing-md);
		display: flex;
		flex-direction: column;
		gap: var(--spacing-lg);
		height: 0;
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

	.cooking-navigation {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--spacing-md);
		gap: var(--spacing-md);

		:global(.nav-button) {
			display: flex;
			align-items: center;
			gap: var(--spacing-xs);
		}

		:global(.nav-icon) {
			fill: currentColor;
		}
	}

	.cooking-step-text {
		font-size: var(--font-size-sm);
		color: var(--color-neutral-light);
		font-weight: var(--font-weight-medium);
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
		color: var(--color-text-on-surface);
		text-align: center;
		padding: 1rem;
	}

	.spinner {
		width: 40px;
		height: 40px;
		border: 4px solid rgba(255, 255, 255, 0.3);
		border-radius: 50%;
		border-top-color: var(--color-text-on-surface);
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

	.step-ingredients {
		padding: var(--spacing-lg);
		background: var(--color-background-dark);
		border-radius: var(--border-radius-2xl);
		margin-bottom: var(--spacing-lg);
	}

	.step-ingredients h4 {
		margin: 0 0 var(--spacing-sm) 0;
		font-size: var(--font-size-md);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-on-surface);
	}

	.ingredients-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xs);
	}

	.ingredient-item {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		padding: var(--spacing-xs) 0;
	}

	.ingredient-quantity {
		font-weight: var(--font-weight-semibold);
	}

	.ingredient-name {
		color: var(--color-text-on-surface);
	}
</style>

<script lang="ts">
	import type { Instruction } from '$lib/types'
	import Button from '$lib/components/button/Button.svelte'
	import Popup from '$lib/components/popup/Popup.svelte'
	import ChevronLeft from 'lucide-svelte/icons/chevron-left'
	import ChevronRight from 'lucide-svelte/icons/chevron-right'
	import Hint from '$lib/components/hint/Hint.svelte'
	import IngredientsList from '$lib/components/ingredients-list/IngredientsList.svelte'
	import type { UnitSystem } from '$lib/state/unitPreference.svelte'
	import Plus from 'lucide-svelte/icons/plus'
	import Minus from 'lucide-svelte/icons/minus'

	let {
		instructions,
		isOpen = $bindable(false),
		inline = false,
		servings = 1,
		originalServings = 1,
		unitSystem = 'imperial'
	}: {
		instructions: Instruction[]
		isOpen: boolean
		inline?: boolean
		servings?: number
		originalServings?: number
		unitSystem?: UnitSystem
	} = $props()

	let currentStep = $state(0)
	let videoLoaded = $state(false)
	let videoError = $state(false)
	let showStepIngredients = $state(false)

	function handleCookingVideoError() {
		videoError = true
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

	$effect(() => {
		currentStep
		if (inline) {
			showStepIngredients = false
		}
	})
</script>

{#snippet navigation()}
	<div class="cooking-navigation">
		<Button color="secondary" onclick={prevStep} disabled={currentStep === 0}>
			<ChevronLeft color="black" />
		</Button>

		<div class="cooking-step-text">
			Step {currentStep + 1} of {instructions.length}
		</div>

		<Button color="secondary" onclick={nextStep}>
			{#if currentStep < instructions.length - 1}
				<ChevronRight color="black" />
			{:else}
				Done
			{/if}
		</Button>
	</div>
{/snippet}

{#snippet content()}
	<div class="cooking-mode">
		{#if inline}
			{@render navigation()}
		{/if}

		<div class="cooking-content">
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
					{#if step.ingredients && step.ingredients.length > 0}
						{#if inline}
							<div class="ingredients-box">
								<button
									type="button"
									class="ingredients-toggle"
									onclick={() => (showStepIngredients = !showStepIngredients)}
									aria-expanded={showStepIngredients}
									aria-controls={`step-ingredients-${currentStep}`}
								>
									<span>Required ingredients</span>
									{#if showStepIngredients}
										<Minus size={18} />
									{:else}
										<Plus size={18} />
									{/if}
								</button>
								{#if showStepIngredients}
									<div class="step-ingredients" id={`step-ingredients-${currentStep}`}>
										<IngredientsList
											ingredients={step.ingredients}
											{servings}
											{originalServings}
											{unitSystem}
										/>
									</div>
								{/if}
							</div>
						{:else}
							<div class="step-ingredients">
								<IngredientsList
									ingredients={step.ingredients}
									{servings}
									{originalServings}
									{unitSystem}
								/>
							</div>
						{/if}
					{/if}

					<p>{step.text}</p>

					{#if step.hint}
						<div class="step-hint"><Hint text={step.hint} /></div>
					{/if}
				</div>
			{/if}
		</div>

		{#if !inline}
			{@render navigation()}
		{/if}
	</div>
{/snippet}

{#if inline}
	{@render content()}
{:else}
	<Popup bind:isOpen onClose={() => (isOpen = false)} width="800px" height="80dvh">
		{@render content()}
	</Popup>
{/if}

<style lang="scss">
	@use '$lib/styles/tokens' as *;

	.cooking-mode {
		display: flex;
		flex-direction: column;
		min-height: 0;
		height: 100%;

		@include mobile {
			justify-content: space-between;
		}
	}

	.cooking-content {
		flex: 1;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-lg);
	}

	.cooking-media {
		width: 100%;
		height: auto;
		background: var(--color-neutral-dark);
		border-radius: var(--border-radius-2xl);
		overflow: hidden;
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.cooking-media-content {
		width: 100%;
		height: auto;
		object-fit: contain;
	}

	.cooking-media img.cooking-media-content {
		height: auto;
		object-fit: contain;
		display: block;
	}

	.cooking-media video.cooking-media-content {
		height: auto;
		object-fit: contain;
	}

	.cooking-navigation {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: var(--spacing-md);
		position: sticky;
		bottom: 0;
		z-index: 1;
		margin-bottom: var(--spacing-md);

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
		color: var(--color-text-on-surface);
		font-weight: var(--font-weight-medium);
	}

	.ingredients-toggle {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
		padding: var(--spacing-sm) var(--spacing-md);
		background: transparent;
		border: none;
		color: var(--color-text);
		font-weight: var(--font-weight-semibold);
		cursor: pointer;
	}

	.ingredients-box {
		background: var(--color-surface);
		border: var(--border-width-thin) solid var(--color-neutral);
		border-radius: var(--border-radius-lg);
		overflow: hidden;
		margin-bottom: var(--spacing-md);
	}

	.ingredients-box .step-ingredients {
		padding: 0 var(--spacing-md) var(--spacing-md);
		margin-bottom: 0;
		margin-top: var(--spacing-sm);
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
		margin-bottom: var(--spacing-lg);
	}

	.step-ingredients h4 {
		margin: 0 0 var(--spacing-sm) 0;
		font-size: var(--font-size-md);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-on-surface);
	}

	.step-hint {
		margin: var(--spacing-md) 0;
	}
</style>

<script lang="ts">
	import Popover from '$lib/components/popover/Popover.svelte'
	import { parseTemperature, getConversionText } from '$lib/utils/temperature'
	import type { TemperatureUnit } from '$lib/utils/temperature'
	import InstructionVideo from '$lib/components/video-player/InstructionVideo.svelte'
	import type { RecipeData } from '$lib/types'
	import CookingMode from '$lib/components/cooking-mode/CookingMode.svelte'
	import Button from '../button/Button.svelte'

	let {
		instructions,
		hideImages = $bindable(false)
	}: { instructions: RecipeData['instructions']; hideImages?: boolean } = $props()

	let isCookingMode = $state(false)
</script>

{#if isCookingMode}
	<CookingMode {instructions} bind:isOpen={isCookingMode} />
{:else}
	<div class="instructions card">
		<div style:margin-bottom="var(--spacing-lg)">
			<Button color="primary" onclick={() => (isCookingMode = true)} fullWidth>
				Step by Step Mode
			</Button>
		</div>
		{#each instructions as instruction, i (i)}
			<div class="instruction-item">
				<div class="instruction-header">
					<div class="instruction-content">
						<div class="instruction-text">
							<h5 class="step-number">Step {i + 1}</h5>
							{#each parseTemperature(instruction.text) as part}
								{#if part.isTemperature && part.value !== undefined && part.unit}
									<span class="temperature-wrapper">
										<Popover triggerOn="hover" placement="top">
											{#snippet trigger()}
												<span class="temperature">{part.text}</span>
											{/snippet}
											{#snippet content()}
												<span class="conversion">
													{getConversionText(part.value as number, part.unit as TemperatureUnit)}
												</span>
											{/snippet}
										</Popover>
									</span>
								{:else}
									<span>{part.text}</span>
								{/if}
							{/each}
						</div>
						{#if instruction.mediaUrl}
							<div class="instruction-media desktop-only">
								{#if instruction.mediaType === 'image'}
									{#if !hideImages}
										<img
											src={instruction.mediaUrl}
											alt={`Step ${i + 1} visual`}
											loading="lazy"
											decoding="async"
										/>
									{/if}
								{:else if instruction.mediaType === 'video'}
									<InstructionVideo src={instruction.mediaUrl} stepNumber={i + 1} />
								{/if}
							</div>
						{/if}
					</div>
				</div>
			</div>
			{#if i < instructions.length - 1}
				<hr class="divider" />
			{/if}
		{/each}
	</div>
{/if}

<style lang="scss">
	@import '$lib/global.scss';

	.instructions {
		overflow: hidden;
		display: flex;
		flex-direction: column;
		gap: 0;
	}

	.instruction-item {
		position: relative;
		transition: all var(--transition-fast) var(--ease-in-out);
		background: none;
		border-radius: 0;
		box-shadow: none;
		margin-bottom: var(--spacing-lg);
	}

	.instruction-item:last-child {
		margin-bottom: 0;
	}

	.instruction-item::before {
		display: none;
	}

	.instruction-item:hover {
		background: none;
	}

	.instruction-header {
		width: 100%;
		display: flex;
		gap: var(--spacing-lg);
		padding: 0;
		background: none;
		text-align: left;
	}

	.instruction-content {
		flex: 1;
		display: grid;
		grid-template-columns: 1fr;
		gap: 0;
		align-items: stretch;
	}

	.instruction-content:has(.instruction-media) {
		grid-template-columns: 1fr 200px;
	}

	@media (max-width: 1200px) {
		.instruction-content:has(.instruction-media) {
			grid-template-columns: 1fr;
		}
	}

	@include tablet {
		.instruction-content:has(.instruction-media) {
			grid-template-columns: 1fr 250px;
		}
	}

	@include mobile {
		.instruction-content {
			display: flex;
			flex-direction: column;
			gap: var(--spacing-md);
		}
	}

	.instruction-text {
		line-height: 1.6;
		font-size: var(--font-size-md);
		padding: var(--spacing-md) var(--spacing-lg) var(--spacing-md) 0;
	}

	.instruction-text span {
		display: inline;
		word-break: break-word;
	}

	.step-number {
		font-weight: var(--font-weight-bold);
	}

	.instruction-media {
		border-radius: 0;
		overflow: hidden;
		will-change: transform;
		content-visibility: auto;
		height: 100%;
		display: flex;
	}

	.instruction-media img,
	.instruction-media video {
		width: 100%;
		height: 100%;
		display: block;
		border-radius: 0;
		aspect-ratio: 16 / 9;
		object-fit: cover;
		will-change: transform;
	}

	.instruction-media :global(.video-container) {
		border-radius: 0;
	}

	@media (max-width: 1200px) {
		.instruction-media {
			display: none;
		}
	}

	.desktop-only {
		@include mobile {
			display: none;
		}
	}

	.temperature {
		text-decoration: underline;
		text-decoration-style: dotted;
		cursor: help;
		display: inline;
	}

	.conversion {
		font-size: var(--font-size-sm);
		white-space: nowrap;
		display: inline;
	}

	.temperature-wrapper {
		display: inline;
	}

	.divider {
		height: 2px;
		background: var(--color-neutral-light);
		opacity: 0.1;
		margin: 0 calc(var(--spacing-lg) * -1);
	}
</style>

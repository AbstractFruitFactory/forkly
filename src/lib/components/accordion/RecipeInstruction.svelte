<script lang="ts">
	import Popover from '$lib/components/popover/Popover.svelte'
	import { parseTemperature, getConversionText } from '$lib/utils/temperature'
	import type { TemperatureUnit } from '$lib/utils/temperature'
	import InstructionVideo from '$lib/components/video-player/InstructionVideo.svelte'

	let { instruction, index } = $props<{
		instruction: {
			text: string
			mediaUrl?: string
			mediaType?: 'image' | 'video'
			[key: string]: any
		}
		index: number
	}>()
</script>

<div class="instruction-item">
	<div class="instruction-header">
		<div class="instruction-content">
			<div class="instruction-text">
				<h5 class="step-number">Step {index + 1}</h5>
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
						<img
							src={instruction.mediaUrl}
							alt={`Step ${index + 1} visual`}
							loading="lazy"
							decoding="async"
						/>
					{:else if instruction.mediaType === 'video'}
						<InstructionVideo src={instruction.mediaUrl} stepNumber={index + 1} />
					{/if}
				</div>
			{/if}
		</div>
	</div>
</div>

<style lang="scss">
	@import '$lib/global.scss';

	.instruction-item {
		background: var(--color-neutral-2);
		border-radius: var(--border-radius-lg);
		overflow: hidden;
		transition: all var(--transition-fast) var(--ease-in-out);
		position: relative;

		&::before {
			content: '';
			position: absolute;
			left: 0;
			top: 0;
			bottom: 0;
			width: 4px;
			background: var(--color-primary);
			border-top-left-radius: var(--border-radius-lg);
			border-bottom-left-radius: var(--border-radius-lg);
		}

		&:hover {
			background: rgba(255, 255, 255, 0.03);
		}
	}

	.instruction-header {
		width: 100%;
		display: flex;
		gap: var(--spacing-lg);
		padding: 0;
		background: rgba(255, 255, 255, 0.02);
		text-align: left;
	}

	.instruction-content {
		flex: 1;
		display: grid;
		grid-template-columns: 1fr;
		gap: 0;
		align-items: stretch;
		padding-left: var(--spacing-lg);

		&:has(.instruction-media) {
			grid-template-columns: 1fr 200px;

			@media (max-width: 1200px) {
				grid-template-columns: 1fr;
			}
		}

		@include tablet {
			&:has(.instruction-media) {
				grid-template-columns: 1fr 250px;
			}
		}

		@include mobile {
			display: flex;
			flex-direction: column;
			gap: var(--spacing-md);
		}
	}

	.instruction-text {
		line-height: 1.6;
		font-size: var(--font-size-md);
		padding: var(--spacing-md) var(--spacing-lg) var(--spacing-md) 0;

		span {
			display: inline;
			word-break: break-word;
		}
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

		img,
		video {
			width: 100%;
			height: 100%;
			display: block;
			border-radius: 0;
			aspect-ratio: 16 / 9;
			object-fit: cover;
			will-change: transform;
		}

		:global(.video-container) {
			border-radius: 0;
		}

		@media (max-width: 1200px) {
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
</style>

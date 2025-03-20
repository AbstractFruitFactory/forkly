<script lang="ts">
	import Popover from '$lib/components/popover/Popover.svelte'
	import { parseTemperature, getConversionText } from '$lib/utils/temperature'
	import type { TemperatureUnit } from '$lib/utils/temperature'
	import InstructionVideo from '$lib/components/video-player/InstructionVideo.svelte'

	let { instruction, index } = $props<{
		instruction: { 
			text: string; 
			mediaUrl?: string;
			mediaType?: 'image' | 'video';
			[key: string]: any 
		}
		index: number
	}>()
</script>

<div class="instruction-item">
	<div class="instruction-header">
		<div class="step-number">{index + 1}</div>
		<div class="instruction-content">
			<div class="instruction-text">
				{#each parseTemperature(instruction.text) as part}
					{#if part.isTemperature && part.value !== undefined && part.unit}
						<span class="temperature-wrapper">
							<Popover triggerOn="hover" placement="top">
								{#snippet trigger()}
									<span class="temperature">{part.text}</span>
								{/snippet}

								{#snippet content()}
									<span class="conversion">
										{getConversionText(
											part.value as number,
											part.unit as TemperatureUnit
										)}
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
		background: var(--color-neutral-dark);
		border-radius: var(--border-radius-lg);
		overflow: hidden;
		transition: all var(--transition-fast) var(--ease-in-out);

		&:hover {
			background: rgba(255, 255, 255, 0.03);
		}
	}

	.instruction-header {
		width: 100%;
		display: flex;
		gap: var(--spacing-lg);
		padding: var(--spacing-md) var(--spacing-lg);
		background: rgba(255, 255, 255, 0.02);
		text-align: left;
	}

	.step-number {
		font-weight: var(--font-weight-bold);
		color: var(--color-primary);
		min-width: var(--spacing-lg);
	}

	.instruction-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
	}

	.instruction-text {
		line-height: 1.6;
		font-size: var(--font-size-md);

		:global(span) {
			display: inline;
		}
	}

	.instruction-media {
		width: 100%;
		max-width: 450px;
		border-radius: var(--border-radius-md);
		overflow: hidden;
		box-shadow: var(--shadow-md);
		will-change: transform;
		content-visibility: auto;

		img,
		video {
			width: 100%;
			display: block;
			border-radius: var(--border-radius-md);
			aspect-ratio: 16 / 9;
			object-fit: cover;
			will-change: transform;
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

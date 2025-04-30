<script lang="ts">
	import type { NutritionInfo } from '$lib/server/food-api'

	let {
		nutrition
	}: {
		nutrition: Omit<NutritionInfo, 'servingSize'>
	} = $props()

	// Calculate calories from macros
	const carbCalories = nutrition.carbs * 4 // 4 calories per gram of carbs
	const fatCalories = nutrition.fat * 9 // 9 calories per gram of fat
	const proteinCalories = nutrition.protein * 4 // 4 calories per gram of protein
	const totalCalories = carbCalories + fatCalories + proteinCalories

	// Prevent NaN by checking if totalCalories is 0
	const carbsPercent = totalCalories === 0 ? 0 : Math.round((carbCalories / totalCalories) * 100)
	const fatPercent = totalCalories === 0 ? 0 : Math.round((fatCalories / totalCalories) * 100)
	const proteinPercent = totalCalories === 0 ? 0 : Math.round((proteinCalories / totalCalories) * 100)

	const carbsProportion = totalCalories === 0 ? 0 : carbCalories / totalCalories
	const fatProportion = totalCalories === 0 ? 0 : fatCalories / totalCalories
	const proteinProportion = totalCalories === 0 ? 0 : proteinCalories / totalCalories

	// Calculate circle parameters
	const radius = 36
	const circumference = 2 * Math.PI * radius

	// Add gap between segments (in percentage of the total circumference)
	const gapSize = 0.03 // 2% gap
	const totalGapSize = gapSize * 3 // 3 gaps (one between each segment)

	// Adjust proportions to account for gaps
	const adjustedCarbsProportion = carbsProportion * (1 - totalGapSize)
	const adjustedFatProportion = fatProportion * (1 - totalGapSize)
	const adjustedProteinProportion = proteinProportion * (1 - totalGapSize)

	// Calculate stroke-dasharray and stroke-dashoffset values for each segment
	const gapPixels = circumference * gapSize
	const carbsDash = circumference * adjustedCarbsProportion
	const fatDash = circumference * adjustedFatProportion
	const proteinDash = circumference * adjustedProteinProportion

	// Calculate offsets (each offset needs to account for previous segment + gap)
	const fatOffset = carbsDash + gapPixels
	const proteinOffset = fatOffset + fatDash + gapPixels

	// Ensure gaps are visible by adjusting offsets
	const adjustedCarbsDash = carbsDash - gapPixels
	const adjustedFatDash = fatDash - gapPixels
	const adjustedProteinDash = proteinDash - gapPixels

	// Update stroke-dasharray with adjusted values
</script>

<div class="nutrition-data">
	<div class="calories-circle">
		<svg width="90" height="90" viewBox="0 0 90 90">
			<!-- Carbs segment (green) -->
			<circle
				class="circle-segment carbs-color"
				cx="45"
				cy="45"
				r={radius}
				stroke-width="10"
				stroke-linecap="round"
				stroke-dasharray="{adjustedCarbsDash} {circumference - adjustedCarbsDash}"
				stroke-dashoffset="0"
				transform="rotate(-90 45 45)"
			/>

			<!-- Fat segment (red) -->
			<circle
				class="circle-segment fat-color"
				cx="45"
				cy="45"
				r={radius}
				stroke-width="10"
				stroke-linecap="round"
				stroke-dasharray="{adjustedFatDash} {circumference - adjustedFatDash}"
				stroke-dashoffset={-fatOffset}
				transform="rotate(-90 45 45)"
			/>

			<!-- Protein segment (purple) -->
			<circle
				class="circle-segment protein-color"
				cx="45"
				cy="45"
				r={radius}
				stroke-width="10"
				stroke-linecap="round"
				stroke-dasharray="{adjustedProteinDash} {circumference - adjustedProteinDash}"
				stroke-dashoffset={-proteinOffset}
				transform="rotate(-90 45 45)"
			/>
		</svg>
		<div class="calories-text">
			<div class="calories-value">{Math.round(nutrition.calories)}</div>
			<div class="calories-unit">cal</div>
		</div>
	</div>

	{#snippet macro(color: string, label: string, value: number, percent: number)}
		<div class="macro-column">
			<div class="macro-label {color}">{label}</div>
			<div class="macro-value">{value} g</div>
			<div class="percent {color}">{percent}%</div>
		</div>
	{/snippet}
	<div class="calories-and-macros">
		{@render macro('carbs-color', 'Carbs', Math.round(nutrition.carbs), carbsPercent)}
		{@render macro('fat-color', 'Fat', Math.round(nutrition.fat), fatPercent)}
		{@render macro('protein-color', 'Protein', Math.round(nutrition.protein), proteinPercent)}
	</div>
</div>

<style lang="scss">
	@import '$lib/global.scss';

	.nutrition-data {
		display: flex;
		align-items: center;
		gap: var(--spacing-lg);
		justify-content: center;
	}

	.calories-and-macros {
		display: flex;
		align-items: center;
		gap: var(--spacing-lg);
	}

	.calories-circle {
		position: relative;
		width: 90px;
		height: 90px;
	}

	.circle-segment {
		fill: none;
		transition: stroke-dashoffset 0.5s ease;
	}

	.carbs-color {
		stroke: #c8a0ff;
		color: #c8a0ff;
	}

	.fat-color {
		stroke: #ff9b61;
		color: #ff9b61;
	}

	.protein-color {
		stroke: #ff595f;
		color: #ff595f;
	}

	.calories-text {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		text-align: center;
		line-height: 1;
	}

	.calories-value {
		font-size: 1.6rem;
		font-weight: var(--font-weight-bold);
	}

	.calories-unit {
		margin-top: -2px;
	}

	.macros {
		display: flex;
		gap: var(--spacing-md);
		justify-content: space-between;
		max-width: 300px;
	}

	.macro-column {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		text-wrap: nowrap;
	}

	.macro-value {
		font-weight: var(--font-weight-bold);
		font-size: var(--font-size-lg);
	}

	.macro-label {
		text-transform: uppercase;
		color: inherit !important;
	}

	@media (max-width: 400px) {
		.percent {
			display: none;
		}

		.calories-and-macros {
			flex-direction: column;
			align-items: flex-start;
			gap: var(--spacing-xs);
		}

		.macro-column {
			flex-direction: row;
			gap: var(--spacing-xs);
		}

		.macro-label {
			&.carbs-color {
				color: #c8a0ff !important;
			}
			&.fat-color {
				color: #ff9b61 !important;
			}
			&.protein-color {
				color: #ff595f !important;
			}
		}

		.macro-label::after {
			content: ':';
			margin-right: var(--spacing-xs);
		}
	}
</style>

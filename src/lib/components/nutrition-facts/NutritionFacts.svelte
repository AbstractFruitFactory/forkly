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

	// Calculate actual percentage of calories from each macro
	const carbsPercent = Math.round((carbCalories / totalCalories) * 100)
	const fatPercent = Math.round((fatCalories / totalCalories) * 100)
	const proteinPercent = Math.round((proteinCalories / totalCalories) * 100)

	// Calculate proportions for the circle segments
	const carbsProportion = carbCalories / totalCalories
	const fatProportion = fatCalories / totalCalories
	const proteinProportion = proteinCalories / totalCalories

	// Calculate circle parameters
	const radius = 36
	const circumference = 2 * Math.PI * radius

	// Add gap between segments (in percentage of the total circumference)
	const gapSize = 0.02 // 2% gap
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
</script>

<div class="nutrition-section">
	<h4>Nutrition Per Serving</h4>

	<div class="nutrition-data">
		<div class="calories-and-macros">
			<div class="calories-circle">
				<svg width="90" height="90" viewBox="0 0 90 90">
					<!-- Carbs segment (green) -->
					<circle
						class="circle-segment carbs-color"
						cx="45"
						cy="45"
						r={radius}
						stroke-width="12"
						stroke-dasharray="{carbsDash} {circumference - carbsDash}"
						stroke-dashoffset="0"
						transform="rotate(-90 45 45)"
					/>

					<!-- Fat segment (red) -->
					<circle
						class="circle-segment fat-color"
						cx="45"
						cy="45"
						r={radius}
						stroke-width="12"
						stroke-dasharray="{fatDash} {circumference - fatDash}"
						stroke-dashoffset={-fatOffset}
						transform="rotate(-90 45 45)"
					/>

					<!-- Protein segment (purple) -->
					<circle
						class="circle-segment protein-color"
						cx="45"
						cy="45"
						r={radius}
						stroke-width="12"
						stroke-dasharray="{proteinDash} {circumference - proteinDash}"
						stroke-dashoffset={-proteinOffset}
						transform="rotate(-90 45 45)"
					/>
				</svg>
				<div class="calories-text">
					<div class="calories-value">{Math.round(nutrition.calories)}</div>
					<div class="calories-unit">cal</div>
				</div>
			</div>

			<div class="macros">
				<div class="macro-column">
					<div class="macro-percent carbs-color">{carbsPercent}%</div>
					<div class="macro-value">{Math.round(nutrition.carbs)} g</div>
					<div class="macro-label">Carbs</div>
				</div>

				<div class="macro-column">
					<div class="macro-percent fat-color">{fatPercent}%</div>
					<div class="macro-value">{Math.round(nutrition.fat)} g</div>
					<div class="macro-label">Fat</div>
				</div>

				<div class="macro-column">
					<div class="macro-percent protein-color">{proteinPercent}%</div>
					<div class="macro-value">{Math.round(nutrition.protein)} g</div>
					<div class="macro-label">Protein</div>
				</div>
			</div>
		</div>
	</div>
</div>

<style lang="scss">
	@import '$lib/global.scss';
	.nutrition-section {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
	}

	.nutrition-data {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
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
		stroke: #39b54a;
		color: #39b54a;
	}

	.fat-color {
		stroke: #ed1c24;
		color: #ed1c24;
	}

	.protein-color {
		stroke: #9e1f63;
		color: #9e1f63;
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
		font-size: 0.75rem;
		color: var(--color-text-secondary);
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

	.macro-percent {
		font-weight: var(--font-weight-bold);
		font-size: var(--font-size-sm);
	}

	.macro-value {
		font-weight: var(--font-weight-medium);
		font-weight: var(--font-weight-bold);
	}

	.macro-label {
		font-size: 0.85rem;
		color: var(--color-text-secondary);
	}
</style>

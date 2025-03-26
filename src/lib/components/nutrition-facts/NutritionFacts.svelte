<script lang="ts">
	import type { NutritionInfo } from '$lib/server/food-api'

	let {
		nutrition
	}: {
		nutrition: Omit<NutritionInfo, 'servingSize'>
	} = $props()
</script>

<div class="nutrition-facts">
	<div class="nutrition-grid">
		<div class="nutrition-item">
			<div class="nutrition-circle">
				<span class="value">{Math.round(nutrition.calories)}</span>
			</div>
			<span class="label">CALORIES</span>
		</div>
		<div class="nutrition-item">
			<div class="nutrition-circle">
				<span class="value">{Math.round(nutrition.protein)}g</span>
			</div>
			<span class="label">PROTEIN</span>
		</div>
		<div class="nutrition-item">
			<div class="nutrition-circle">
				<span class="value">{Math.round(nutrition.carbs)}g</span>
			</div>
			<span class="label">CARBS</span>
		</div>
		<div class="nutrition-item">
			<div class="nutrition-circle">
				<span class="value">{Math.round(nutrition.fat)}g</span>
			</div>
			<span class="label">FAT</span>
		</div>
	</div>
	<p class="nutrition-disclaimer">* Nutrition information is estimated</p>
</div>

<style lang="scss">
	@import '$lib/global.scss';

	.nutrition-facts {
		margin: var(--spacing-md) 0;
	}

	.nutrition-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: var(--spacing-md);
		margin-bottom: var(--spacing-sm);

		@include mobile {
			gap: var(--spacing-xs);
		}
	}

	.nutrition-item {
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.nutrition-circle {
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		background: var(--color-neutral-dark);
		border: 2px solid var(--color-primary);
		width: 70px;
		height: 70px;
		margin-bottom: var(--spacing-xs);

		@include mobile {
			width: 48px;
			height: 48px;
			border-width: 1.5px;
		}
	}

	.value {
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-bold);
		color: var(--color-primary);

		@include mobile {
			font-size: var(--font-size-sm);
		}
	}

	.label {
		display: block;
		font-size: var(--font-size-xs);
		color: var(--color-neutral-light);
		margin-top: var(--spacing-xs);
		letter-spacing: 0.5px;

		@include mobile {
			font-size: calc(var(--font-size-xs) * 0.9);
			margin-top: calc(var(--spacing-xs) / 2);
			letter-spacing: 0.3px;
		}
	}

	.nutrition-disclaimer {
		text-align: center;
		font-size: var(--font-size-xs);
		color: var(--color-neutral);
		font-style: italic;
		margin-top: var(--spacing-md);

		@include mobile {
			font-size: calc(var(--font-size-xs) * 0.9);
			margin-top: var(--spacing-xs);
		}
	}
</style>

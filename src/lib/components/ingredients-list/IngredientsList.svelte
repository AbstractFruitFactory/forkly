<script lang="ts">
	import type { Ingredient } from '$lib/types'
	import type { UnitSystem } from '$lib/state/unitPreference.svelte'
	import { getFormattedIngredient } from '$lib/pages/recipe/utils/recipeUtils'
	import ServingsAdjuster from '$lib/components/servings-adjuster/ServingsAdjuster.svelte'

	let {
		ingredients,
		unitSystem,
		currentServings,
		onServingsChange
	}: {
		ingredients: Ingredient[]
		unitSystem: UnitSystem
		currentServings: number
		onServingsChange: (newServings: number) => void
	} = $props()
</script>

<ul class="ingredients-list">
	{#each ingredients as ingredient}
		{@const formattedIngredient = getFormattedIngredient(ingredient, unitSystem)}
		<li>
			<span class="measurement">
				{#if ingredient.measurement === 'to taste' || ingredient.measurement === 'pinch'}
					{ingredient.measurement}
				{:else}
					{formattedIngredient.formattedMeasurement}
				{/if}
			</span>
			<span class="ingredient-name">
				{ingredient.name}
				{#if ingredient.custom}
					<span class="custom-badge">custom</span>
				{/if}
			</span>
		</li>
	{/each}
</ul>

<ServingsAdjuster servings={currentServings} {onServingsChange} />

<style lang="scss">
	@import '$lib/global.scss';

	.ingredients-list {
		margin-bottom: var(--spacing-md);
		li {
			list-style: none;
			padding: var(--spacing-md) 0;
			border-bottom: 2px dotted rgba(255, 255, 255, 0.1);
			display: flex;
			font-size: var(--font-size-sm);
			width: 100%;

			&:last-child {
				border-bottom: none;
			}
		}
	}

	.measurement {
		margin-right: var(--spacing-sm);
		font-weight: var(--font-weight-semibold);

		min-width: 50px;

		@include tablet {
			min-width: 60px;
		}
	}

	.ingredient-name {
		color: var(--color-neutral-lightest);
	}

	.custom-badge {
		font-size: var(--font-size-xs);
		background: var(--color-primary-light);
		color: var(--color-neutral-darkest);
		padding: var(--spacing-xs) var(--spacing-sm);
		border-radius: var(--border-radius-md);
		margin-left: var(--spacing-sm);
		vertical-align: middle;
		font-weight: var(--font-weight-semibold);
	}
</style>
